import React, { useEffect, useRef } from "react";
import { Animated, View, Platform } from "react-native";

// Configuration files
import gapConfig from "./config/gapConfig";
import physicsConfig from "./config/physicsConfig";
import playerConfig from "./config/playerConfig";
import {
  collisionBoxes,
  handleCollision,
  floorHeight,
  screenWidth,
  screenHeight,
} from "./physics/collisionPhysics";
import { handleTouch } from "./input/input";

export default function Engine() {
  // useRef ensures values are not reset each render

  // Frame reference
  const frame = useRef(null);

  // Physics variables
  const gravity = physicsConfig.gravity; // Default is 0.2
  const friction = physicsConfig.friction; // Default is 0.98, a 2% speed reduction per frame

  // Platform specific gap size
  const gapSize = Platform.OS === "web" ? gapConfig.web : gapConfig.default;

  // Player collision box
  const playerBox = playerConfig;

  // Player position and velocity
  const positionXRef = useRef(new Animated.Value(playerBox.x)).current;
  const positionYRef = useRef(new Animated.Value(playerBox.y)).current;
  let velocityXRef = useRef(playerBox.velocityX);
  let velocityYRef = useRef(playerBox.velocityY);

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

      collisionBoxes.forEach((box) => {
        // Check intersecting playerBox and collisionBox
        if (
          currentPlayerBox.x < box.x + box.width &&
          currentPlayerBox.x + currentPlayerBox.width > box.x &&
          currentPlayerBox.y < box.y + box.height &&
          currentPlayerBox.y + playerBox.height > box.y
        ) {
          // Collision detected
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
          width: playerBox.width,
          height: playerBox.height,
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
          bottom: 0, // Set position from bottom of screen
          left: collisionBoxes[0].x, // Set position from left of screen
          width: screenWidth,
          height: floorHeight,
          backgroundColor: "#f0f0f0",
        }}
      />
      {/* Platform */}
      <View
        style={{
          position: "absolute",
          bottom: 400, // Set position from bottom of screen
          left: collisionBoxes[4].x, // Set position from left of screen
          width: screenWidth / 4,
          height: floorHeight / 4,
          backgroundColor: "#f0f0f0",
        }}
      />
    </View>
  );
}
