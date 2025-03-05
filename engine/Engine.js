import React, { useEffect, useRef } from "react";
import { Animated, View, Platform } from "react-native";

// Configuration files
import gapConfig from "./config/gapConfig";
import playerConfig from "./config/playerConfig";
import { collisionBoxes, handleCollision } from "./physics/collisionPhysics";
import { handleTouch } from "./input/input";

export default function Engine() {
  // useRef ensures values are not reset each render

  // Frame reference
  const frame = useRef(null);

  // Physics variables
  const gravity = 0.2;
  const friction = 0.98; // 2% speed reduction per frame
  const positionXRef = useRef(new Animated.Value(50)).current;
  const positionYRef = useRef(new Animated.Value(50)).current;
  let velocityXRef = useRef(0);
  let velocityYRef = useRef(0);

  // Platform specific gap size
  const gapSize = Platform.OS === "web" ? gapConfig.web : gapConfig.default;

  // Player collision box
  const playerBox = playerConfig;

  // Create recursive update loop for physics
  const Update = () => {
    // Update physics

    // Apply friction
    velocityXRef.current *= friction;

    // Apply gravity
    velocityYRef.current += gravity;

    // Log velocity
    console.log(
      "Update velocities:",
      velocityXRef.current,
      velocityYRef.current
    );

    // Get next position
    let nextY = positionYRef._value + velocityYRef.current;
    let nextX = positionXRef._value + velocityXRef.current;

    // Check for collisions
    const checkCollisions = () => {
      // Get current player position
      const currentPlayerBox = {
        ...playerBox,
        x: positionXRef._value + gapSize,
        y: positionYRef._value + gapSize,
      };

      let hasCollision = false;

      collisionBoxes.forEach((box) => {
        // Check intersecting playerBox and collisionBox
        if (
          currentPlayerBox.x < box.x + box.width &&
          currentPlayerBox.x + currentPlayerBox.width > box.x &&
          currentPlayerBox.y < box.y + box.height &&
          currentPlayerBox.y + playerBox.height > box.y
        ) {
          // Collision detected
          hasCollision = true;
          handleCollision(
            box,
            velocityXRef,
            velocityYRef,
            positionXRef,
            positionYRef,
            playerBox
          );

          // Enforce boundaries
          switch (box.type) {
            case "floor":
              if (nextY > box.y - (playerBox.height + gapSize)) {
                nextY = box.y - (playerBox.height + gapSize);
              }
              break;
            case "ceiling":
              if (nextY < box.y + (playerBox.height + gapSize)) {
                nextY = box.y + box.height;
              }
              break;
            case "leftWall":
              if (nextX < box.x + (playerBox.width + gapSize)) {
                nextX = box.x + box.width;
              }
              break;
            case "rightWall":
              if (nextX > box.x - (playerBox.width + gapSize)) {
                nextX = box.x - (playerBox.width + gapSize);
              }
              break;
          }
        }

        // Only apply gravity if no collision at all
        // if (!hasCollision) {
        //   // No collision
        //   velocityYRef.current += gravity;
        // }
      });
    };

    checkCollisions();

    // Set next position
    positionYRef.setValue(nextY);
    positionXRef.setValue(nextX);

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
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(event) =>
        handleTouch(
          event,
          positionXRef,
          positionYRef,
          velocityXRef,
          velocityYRef,
          playerBox
        )
      }
      onResponderMove={(event) =>
        handleTouch(
          event,
          positionXRef,
          positionYRef,
          velocityXRef,
          velocityYRef,
          playerBox
        )
      }
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
