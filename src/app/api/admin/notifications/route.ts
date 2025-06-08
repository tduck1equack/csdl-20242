import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, $Enums } from "@/generated/client";
import { requireAdmin } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, let's get all notifications for the admin dashboard
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");

    interface WhereClause {
      type?: $Enums.NotificationType;
      isRead?: boolean;
    }

    const where: WhereClause = {};

    if (type && type !== "all") {
      // Validate that the type is a valid NotificationType
      if (
        Object.values($Enums.NotificationType).includes(
          type as $Enums.NotificationType
        )
      ) {
        where.type = type as $Enums.NotificationType;
      }
    }

    if (isRead !== null && isRead !== "all") {
      where.isRead = isRead === "true";
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      message,
      type,
      actionUrl,
      sendToAll,
      targetRole,
      targetUserId,
    } = body;

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Title, message, and type are required" },
        { status: 400 }
      );
    }

    if (sendToAll) {
      // Send to all users
      const users = await prisma.user.findMany({
        select: { id: true },
        where: targetRole && targetRole !== "all" ? { role: targetRole } : {},
      });

      await prisma.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          title,
          message,
          type,
          actionUrl: actionUrl || null,
        })),
      });

      return NextResponse.json({
        message: `Notification sent to ${users.length} users`,
        count: users.length,
      });
    } else if (targetUserId) {
      // Send to specific user
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          title,
          message,
          type,
          actionUrl: actionUrl || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Notification sent successfully",
        notification,
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Either sendToAll must be true or targetUserId must be provided",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, isRead } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Notification IDs array is required" },
        { status: 400 }
      );
    }

    // Mark notifications as read/unread
    const updatedNotifications = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        isRead: isRead !== false,
      },
    });

    return NextResponse.json({
      message: `${updatedNotifications.count} notifications updated`,
      count: updatedNotifications.count,
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Notification IDs array is required" },
        { status: 400 }
      );
    }

    // Delete notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
    });

    return NextResponse.json({
      message: `${deletedNotifications.count} notifications deleted`,
      count: deletedNotifications.count,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
