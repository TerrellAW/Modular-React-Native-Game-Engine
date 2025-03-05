import { Dimensions, Platform } from "react-native";

// Configuration files
import gapConfig from "../config/gapConfig";

// Gap size between floor and player (Platform specific)
const gapSize = Platform.OS === "web" ? gapConfig.web : gapConfig.default;

// Screen dimensions
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

// Floor height
const floorHeight = 100;

// Environment collision boxes
export const collisionBoxes = [
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
  {
    // Ceiling
    type: "ceiling",
    width: screenWidth,
    height: 1,
    x: 0,
    y: Platform.OS === "android" ? 25 : -gapSize, // Add by 25 if Android and subtract gapSize if on PC
  },
  {
    // Left wall
    type: "wall",
    width: 5,
    height: screenHeight,
    x: 5, // I want to use gapSize but walls are stupid
    y: 0,
  },
  {
    // Right wall
    type: "wall",
    width: 5,
    height: screenHeight,
    x: screenWidth - 5, // I want to use gapSize but walls are stupid
    y: 0,
  },
];

// Collision handler
export const handleCollision = (
  box,
  velocityXRef,
  velocityYRef,
  positionXRef,
  positionYRef,
  playerBox
) => {
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
      break;

    case "wall": // It just oscillates, i don't know why
      // Bounce horizontally off wall
      if (Math.abs(velocityXRef.current > 0.5)) {
        positionXRef.setValue(box.x + playerBox.width + 5); // Set player position to the left of the wall
        velocityXRef.current = -velocityXRef.current; // Reverse horizontal velocity and reduce by bounce factor
      } else if (Math.abs(velocityXRef.current < -0.5)) {
        positionXRef.setValue(box.x - playerBox.width - 5); // Set player position to the right of the wall
        velocityXRef.current = -velocityXRef.current; // Reverse horizontal velocity and reduce by bounce factor
      } else {
        velocityXRef.current = 0;
      }
      break;
  }
};
