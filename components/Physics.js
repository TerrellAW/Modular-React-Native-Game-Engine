import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

export default function Physics() {
  // useRef ensures values are not reset each render

  // Player controller
  const positionXRef = useRef(new Animated.Value(0)).current;
  const positionYRef = useRef(new Animated.Value(0)).current;

  // Frame reference
  const frame = useRef(null);

  // Physics variables
  const gravity = 0.2;
  let velocityXRef = useRef(0);
  let velocityYRef = useRef(0);

  // Create recursive update loop for physics
  const Update = () => {
    // Update physics

    // Log velocity
    console.log(velocityYRef.current);

    // Get next position
    const nextY = positionYRef._value + velocityYRef.current;

    // Get floor position
    const floorY = Dimensions.get("window").height - 125; // If testing on PC change to 150, if on mobile change to 125

    // Check if player is grounded
    const isGrounded = positionYRef._value >= floorY - 1;

    // Floor collision (100 is floor height and 50 is player height)
    if (isGrounded) {
      // Bounce with 20% of energy
      velocityYRef.current *= -0.2;

      // Rest on floor
      if (Math.abs(velocityYRef.current) < 0.5) {
        velocityYRef.current = 0;
        positionYRef.setValue(floorY); // One pixel above floor
        frame.current = requestAnimationFrame(Update); // Call next physics render, necessary due to return
        return; // Exit early when grounded, prevents falling through floor
      }
    } else {
      // Fall
      velocityYRef.current += gravity;
    }

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
