import React, { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";

// Configuration files
import playerConfig from "./config/playerConfig";
import { collisionBoxes, handleCollision } from "./physics/collisionPhysics";

export default function Engine() {
  // useRef ensures values are not reset each render

  // Frame reference
  const frame = useRef(null);

  // Physics variables
  const gravity = 0.2;
  const positionXRef = useRef(new Animated.Value(0)).current;
  const positionYRef = useRef(new Animated.Value(0)).current;
  let velocityXRef = useRef(0);
  let velocityYRef = useRef(0);

  // Player collision box
  const playerBox = playerConfig;

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
          handleCollision(box, velocityYRef, positionYRef, playerBox);
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
