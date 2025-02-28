import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, View } from "react-native";

export default function Physics() {
  // Platform specific adjustments

  // Gap size between floor and player
  const gapSize = Platform.select({
    web: 5,
    default: 1,
  });

  // Screen dimensions
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // useRef ensures values are not reset each render

  // Frame reference
  const frame = useRef(null);

  // Physics variables
  const gravity = 0.2;
  const positionXRef = useRef(new Animated.Value(0)).current;
  const positionYRef = useRef(new Animated.Value(0)).current;
  let velocityXRef = useRef(0);
  let velocityYRef = useRef(0);

  // Floor height
  const floorHeight = 100;

  // Player collision box
  const playerBox = {
    width: 50,
    height: 50,
  };

  // Environment collision boxes
  const collisionBoxes = [
    {
      // Floor
      type: "floor",
      width: screenWidth,
      height: floorHeight,
      x: 0,
      y:
        screenHeight -
        (floorHeight - (Platform.OS === "android" ? 25 : -gapSize)), // Subtract by 25 if Android and add gapSize if on PC
    },
  ];

  // Collision handler
  function handleCollision(box) {
    // Bounce multiplier (0.2 means 20% of velocity goes into bounce)
    const bounceFactor = 0.2;

    switch (box.type) {
      // Calculate bounce based on collision type
      case "floor":
        // Bounce vertically off floor
        if (velocityYRef.current > 0) {
          velocityYRef.current = -velocityYRef.current * bounceFactor; // Reverse vertical velocity and reduce by bounce factor
          positionYRef.setValue(
            box.y - (playerBox.height + gapSize) // 1 pixel above floor by default
          ); // Set player position above floor
        }

        // Settle if velocity is low enough
        if (Math.abs(velocityYRef.current) < 0.5) {
          velocityYRef.current = 0;
          positionYRef.setValue(
            box.y - (playerBox.height + gapSize) // 1 pixel above floor by default
          ); // Set player position above floor
        }
        break;

      case "ceiling":
        // Bounce vertically off ceiling
        if (velocityYRef.current < 0) {
          velocityYRef.current = -velocityYRef.current * bounceFactor; // Reverse vertical velocity and reduce by bounce factor
          positionYRef.setValue(
            box.y + (playerBox.height + gapSize) // 1 pixel below ceiling by default
          ); // Set player position below ceiling
        }

      //case "wall":
      // Bounce horizontally off wall
    }
  }

  // Create recursive update loop for physics
  const Update = () => {
    // Update physics

    // Log velocity
    console.log(velocityYRef.current);

    // Get next position
    const nextY = positionYRef._value + velocityYRef.current;

    // Check for collisions
    const checkCollisions = () => {
      // Get current player position
      const currentPlayerBox = {
        ...playerBox,
        x: positionXRef._value,
        y: positionYRef._value,
      };

      collisionBoxes.forEach((box) => {
        // Check intersecting playerBox and collisionBox
        if (
          currentPlayerBox.x < box.x + box.width &&
          currentPlayerBox.x + currentPlayerBox.width > box.x &&
          currentPlayerBox.y < box.y + box.height &&
          currentPlayerBox.y + playerBox.height > box.y
        ) {
          // Collision detected
          console.log("Collision detected!");
          handleCollision(box);
        } else {
          // No collision
          velocityYRef.current += gravity;
        }
      });
    };

    checkCollisions();

    // Set next position
    positionYRef.setValue(nextY);

    // Ensure frame-based updates
    frame.current = requestAnimationFrame(Update);
  };

  useEffect(() => {
    // Start physics loop
    frame.current = requestAnimationFrame(Update);

    // Clean up
    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, []);

  // Render graphics with Animated API
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#202121",
      }}
    >
      {/* Player */}
      <Animated.View
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          backgroundColor: "#f0f0f0",
          transform: [
            { translateX: positionXRef },
            { translateY: positionYRef },
          ],
        }}
      />
      {/* Floor */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 100,
          backgroundColor: "#f0f0f0",
        }}
      />
    </View>
  );
}
