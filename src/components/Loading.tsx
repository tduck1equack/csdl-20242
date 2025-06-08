"use client";

import { Flex, Text } from "@radix-ui/themes";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-screen"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <Text size="3" color="gray">
        {message}
      </Text>
    </Flex>
  );
}
