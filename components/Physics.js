import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

export default function Physics() {
  // useRef ensures values are not reset each render

  // Screen dimensions
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Frame reference
  const frame = useRef(null);

  // Physics variables
  const gravity = 0.2;
  const positionXRef = useRef(new Animated.Value(0)).current;
  const positionYRef = useRef(new Animated.Value(0)).current;
  let velocityXRef = useRef(0);
  let velocityYRef = useRef(0);

  // Collision boxes
  const collisionBoxes = [
    {
      // Floor
      x: 0,
      y: screenHeight - 75, // Top of floor is 100px from bottom of screen ( 100 on PC, 75 on mobile )
      width: screenWidth,
      height: 100,
      type: "floor",
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
          positionYRef.setValue(box.y - 51); // Set player position to 1 pixel above floor
        }

        // Settle if velocity is low enough
        if (Math.abs(velocityYRef.current) < 0.5) {
          velocityYRef.current = 0;
          positionYRef.setValue(box.y - 51); // Set player position to 1 pixel above floor
        }
        break;

      case "ceiling":
        // Bounce vertically off ceiling
        if (velocityYRef.current < 0) {
          velocityYRef.current = -velocityYRef.current * bounceFactor; // Reverse vertical velocity and reduce by bounce factor
          positionYRef.setValue(box.y + 51); // Set player position to 1 pixel below ceiling
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
      // Player collision box
      const playerBox = {
        x: positionXRef._value,
        y: positionYRef._value,
        width: 50,
        height: 50,
      };

      collisionBoxes.forEach((box) => {
        // Check intersecting playerBox and collisionBox
        if (
          playerBox.x < box.x + box.width &&
          playerBox.x + playerBox.width > box.x &&
          playerBox.y < box.y + box.height &&
          playerBox.y + playerBox.height > box.y
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
        position: "relative",
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
