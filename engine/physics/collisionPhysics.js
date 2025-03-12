import { Dimensions, Platform } from "react-native";

// Configuration files
import gapConfig from "../config/gapConfig";
import physicsConfig from "../config/physicsConfig";

// Gap size between floor and player (Platform specific)
const gapSize = Platform.OS === "web" ? gapConfig.web : gapConfig.default;

// Screen dimensions
export const screenWidth = Dimensions.get("window").width;
export const screenHeight = Dimensions.get("window").height;

// Floor height
export const floorHeight = 100;

// Environment collision boxes
export const collisionBoxes = [
  {
    name: "floor",
    width: screenWidth,
    height: floorHeight,
    x: 0,
    y:
      screenHeight -
      (floorHeight - (Platform.OS === "android" ? 25 : -gapSize)), // Subtract by 25 if Android and add gapSize if on PC
  },
  {
    name: "screenTop",
    width: screenWidth,
    height: 1,
    x: 0,
    y: Platform.OS === "android" ? 25 : -gapSize, // Add by 25 if Android and subtract gapSize if on PC
  },
  {
    name: "leftScreenEdge",
    width: 1,
    height: screenHeight,
    x: 0, // I want to use gapSize but walls are stupid
    y: 0,
  },
  {
    name: "rightScreenEdge",
    width: 1,
    height: screenHeight,
    x: screenWidth - 1, // I want to use gapSize but walls are stupid
    y: 0,
  },
  {
    name: "platform1",
    width: screenWidth / 4 + 2, // 2 pixel off the platform
    height: floorHeight / 4, // Full height of platform
    x: screenWidth - screenWidth / 4 - 2, // 2 pixel off the platform
    y: screenHeight - 400,
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
  // Bounce multiplier (Default: 0.2, means 20% of velocity goes into bounce)
  const bounceFactor = physicsConfig.bounceFactor;

  // Calculate relative positions and directions
  const playerBottom = positionYRef._value + playerBox.height;
  const playerRight = positionXRef._value + playerBox.width;
  const boxBottom = box.y + box.height;
  const boxRight = box.x + box.width;

  // Check collision direction (simplified)
  if (playerBottom > box.y - gapSize && velocityYRef.current > 0) {
    // Collision from above (floor-like behavior)
    if (Math.abs(velocityYRef.current) < 1) {
      velocityYRef.current = 0;
      positionYRef.setValue(box.y - playerBox.height - gapSize);
    } else {
      velocityYRef.current *= -bounceFactor; // Reverse and reduce vertical velocity
    }
    // Slipperiness (reduce horizontal speed)
    velocityXRef.current *= 0.9;
  }

  if (playerBottom < boxBottom + gapSize && velocityYRef.current < 0) {
    // Collision from below (ceiling-like behavior)
    velocityYRef.current *= -bounceFactor; // Reverse and reduce vertical velocity
  }

  if (playerRight > box.x - gapSize && velocityXRef.current > 0) {
    // Collision from left (right wall-like behavior)
    velocityXRef.current *= -1; // Reverse horizontal velocity
  }

  if (positionXRef._value < boxRight + gapSize && velocityXRef.current < 0) {
    // Collision from right (left wall-like behavior)
    velocityXRef.current *= -1; // Reverse horizontal velocity
  }
};
