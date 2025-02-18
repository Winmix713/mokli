"use client"

import type React from "react"
import { useState } from "react"
import { Filter } from "lucide-react"
import StyleControls from "./style-controls"

const defaultControls = {
  glassmorphism: {
    transparency: { value: 0.2, min: 0, max: 1, step: 0.01 },
    blur: { value: 5, min: 0, max: 20, step: 0.1 },
    outline: { value: 1, min: 0, max: 5, step: 0.1 },
  },
  neumorphism: {
    elevation: { value: 5, min: 0, max: 20, step: 1 },
    intensity: { value: 0.1, min: 0, max: 1, step: 0.01 },
    radius: { value: 10, min: 0, max: 50, step: 1 },
    distance: { value: 10, min: 5, max: 30, step: 1 },
  },
  skeuomorphism: {
    depth: { value: 5, min: 0, max: 20, step: 1 },
    texture: { value: 0.5, min: 0, max: 1, step: 0.1 },
    shine: { value: 0.3, min: 0, max: 1, step: 0.1 },
  },
  claymorphism: {
    roundness: { value: 24, min: 0, max: 50, step: 1 },
    depth: { value: 8, min: 0, max: 20, step: 1 },
    softness: { value: 0.5, min: 0, max: 1, step: 0.1 },
  },
  brutalism: {
    offset: { value: 4, min: 0, max: 20, step: 1 },
    thickness: { value: 2, min: 1, max: 10, step: 1 },
    rotation: { value: -2, min: -10, max: 10, step: 1 },
  },
  retro: {
    grain: { value: 0.1, min: 0, max: 1, step: 0.1 },
    fade: { value: 0.2, min: 0, max: 1, step: 0.1 },
    pattern: { value: 0.5, min: 0, max: 1, step: 0.1 },
  },
  cyberpunk: {
    glow: { value: 10, min: 0, max: 30, step: 1 },
    neon: { value: 0.8, min: 0, max: 1, step: 0.1 },
    glitch: { value: 0.3, min: 0, max: 1, step: 0.1 },
  },
  vaporwave: {
    hueRotate: { value: 180, min: 0, max: 360, step: 1 },
    saturation: { value: 1.5, min: 0, max: 3, step: 0.1 },
    blur: { value: 0.5, min: 0, max: 3, step: 0.1 },
  },
  holographic: {
    iridescence: { value: 0.5, min: 0, max: 1, step: 0.1 },
    rainbow: { value: 0.7, min: 0, max: 1, step: 0.1 },
    shimmer: { value: 0.3, min: 0, max: 1, step: 0.1 },
  },
  glitch: {
    intensity: { value: 0.5, min: 0, max: 1, step: 0.1 },
    frequency: { value: 0.3, min: 0, max: 1, step: 0.1 },
    rgbShift: { value: 3, min: 0, max: 10, step: 1 },
  },
  duotone: {
    contrast: { value: 1.2, min: 0.5, max: 2, step: 0.1 },
    colorBalance: { value: 0.5, min: 0, max: 1, step: 0.1 },
    intensity: { value: 0.8, min: 0, max: 1, step: 0.1 },
  },
  gradientMesh: {
    complexity: { value: 0.5, min: 0, max: 1, step: 0.1 },
    blend: { value: 0.7, min: 0, max: 1, step: 0.1 },
    distortion: { value: 0.3, min: 0, max: 1, step: 0.1 },
  },
  lowPoly: {
    segments: { value: 10, min: 3, max: 30, step: 1 },
    depth: { value: 0.5, min: 0, max: 1, step: 0.1 },
    noise: { value: 0.3, min: 0, max: 1, step: 0.1 },
  },
  isometric: {
    elevation: { value: 30, min: 0, max: 60, step: 1 },
    rotation: { value: 45, min: 0, max: 360, step: 1 },
    depth: { value: 10, min: 0, max: 50, step: 1 },
  },
  flatDesign2: {
    elevation: { value: 2, min: 0, max: 10, step: 1 },
    radius: { value: 8, min: 0, max: 20, step: 1 },
    contrast: { value: 0.1, min: 0, max: 1, step: 0.1 },
  },
  kineticTypography: {
    speed: { value: 1, min: 0.1, max: 3, step: 0.1 },
    amplitude: { value: 10, min: 0, max: 50, step: 1 },
    frequency: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
  },
}

export default function StyleSwitcher() {
  const [currentStyle, setCurrentStyle] = useState("glassmorphism")
  const [controls, setControls] = useState(defaultControls)

  const handleControlChange = (control: string, value: number) => {
    setControls((prev) => ({
      ...prev,
      [currentStyle]: {
        ...prev[currentStyle],
        [control]: {
          ...prev[currentStyle][control],
          value,
        },
      },
    }))
  }

  const getStyleClasses = () => {
    const currentControls = controls[currentStyle]

    switch (currentStyle) {
      case "glassmorphism":
        return `
          bg-white/[${currentControls.transparency.value}]
          backdrop-blur-[${currentControls.blur.value}px]
          border-[${currentControls.outline.value}px]
          border-white/30
          rounded-lg
          shadow-lg
        `
      case "neumorphism":
        return `
          bg-gray-200
          rounded-[${currentControls.radius.value}px]
          shadow-[${currentControls.distance.value}px_${currentControls.distance.value}px_${currentControls.elevation.value}px_rgba(0,0,0,${currentControls.intensity.value}),-${currentControls.distance.value}px_-${currentControls.distance.value}px_${currentControls.elevation.value}px_rgba(255,255,255,0.8)]
        `
      case "skeuomorphism":
        return `
          bg-gradient-to-b from-gray-100 to-gray-300
          rounded-lg
          border-t-4 border-gray-400
          shadow-[inset_0_-${currentControls.depth.value}px_${currentControls.depth.value}px_rgba(0,0,0,${currentControls.texture.value}),0_${currentControls.depth.value}px_${currentControls.depth.value}px_rgba(0,0,0,0.1)]
          [background-image:linear-gradient(${90 + currentControls.shine.value * 45}deg,transparent_0%,rgba(255,255,255,${currentControls.shine.value})_50%,transparent_100%)]
        `
      case "claymorphism":
        return `
          bg-pink-300
          rounded-[${currentControls.roundness.value}px]
          border-8 border-pink-200
          shadow-[${currentControls.depth.value}px_${currentControls.depth.value}px_${currentControls.depth.value * 2}px_#b8a8b0,-${currentControls.depth.value}px_-${currentControls.depth.value}px_${currentControls.depth.value * 2}px_#fae4f2]
          [filter:contrast(${1 - currentControls.softness.value * 0.2})]
        `
      case "brutalism":
        return `
          bg-yellow-400
          border-[${currentControls.thickness.value}px] border-black
          transform rotate-[${currentControls.rotation.value}deg]
          shadow-[${currentControls.offset.value}px_${currentControls.offset.value}px_0_0_#000]
        `
      case "retro":
        return `
          bg-amber-200
          rounded-lg border-4 border-double border-amber-800
          [background-image:radial-gradient(circle,rgba(0,0,0,${currentControls.grain.value})_1px,transparent_1px),radial-gradient(circle,rgba(0,0,0,${currentControls.grain.value})_1px,transparent_1px)]
          [background-size:20px_20px]
          [filter:sepia(${currentControls.fade.value})]
          opacity-[${1 - currentControls.pattern.value * 0.3}]
        `
      case "cyberpunk":
        return `
          bg-gray-900
          border-2 border-cyan-400
          rounded-md
          shadow-[0_0_${currentControls.glow.value}px_#00ffff,0_0_${currentControls.glow.value * 2}px_rgba(0,255,255,${currentControls.neon.value})]
          [animation:glitch_${currentControls.glitch.value}s_infinite]
        `
      case "vaporwave":
        return `
          bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500
          rounded-lg
          [filter:hue-rotate(${currentControls.hueRotate.value}deg)_saturate(${currentControls.saturation.value})_blur(${currentControls.blur.value}px)]
        `
      case "holographic":
        return `
          bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300
          rounded-lg
          [background-size:200%_200%]
          [animation:rainbow_3s_ease_infinite]
          [filter:brightness(${1 + currentControls.iridescence.value})_contrast(${1 + currentControls.rainbow.value})]
          before:absolute before:inset-0 before:bg-white/[${currentControls.shimmer.value}] before:[animation:shimmer_2s_infinite]
        `
      case "glitch":
        return `
          bg-gray-900
          rounded-lg
          [animation:glitch_${currentControls.frequency.value}s_infinite]
          [filter:brightness(1.2)_contrast(1.2)]
          before:absolute before:inset-0 before:bg-red-500/30 before:transform before:translate-x-[${currentControls.rgbShift.value}px]
          after:absolute after:inset-0 after:bg-blue-500/30 after:transform after:translate-x-[-${currentControls.rgbShift.value}px]
          [mix-blend-mode:screen]
        `
      case "duotone":
        return `
          bg-gradient-to-r from-purple-600 to-yellow-400
          rounded-lg
          [filter:contrast(${currentControls.contrast.value})_brightness(1.2)]
          [mix-blend-mode:color]
          after:absolute after:inset-0 after:bg-gradient-to-r after:from-purple-600 after:to-yellow-400 after:[mix-blend-mode:screen] after:opacity-[${currentControls.intensity.value}]
        `
      case "gradientMesh":
        return `
          bg-gradient-to-r from-red-500 via-purple-500 to-blue-500
          rounded-lg
          [background-size:${200 + currentControls.complexity.value * 200}%_${200 + currentControls.complexity.value * 200}%]
          [animation:gradient_${5 - currentControls.blend.value * 3}s_ease_infinite]
          [filter:contrast(${1 + currentControls.distortion.value})]
        `
      case "lowPoly":
        return `
          bg-blue-500
          rounded-lg
          [clip-path:polygon(${Array.from({ length: currentControls.segments.value }, (_, i) => {
            const angle = (i / currentControls.segments.value) * Math.PI * 2
            const radius = 50 + Math.random() * currentControls.noise.value * 10
            const x = 50 + Math.cos(angle) * radius
            const y = 50 + Math.sin(angle) * radius
            return `${x}% ${y}%`
          }).join(",")})]
          [transform:perspective(${1000 + currentControls.depth.value * 1000}px)]
        `
      case "isometric":
        return `
          bg-gradient-to-br from-blue-400 to-blue-600
          [transform:rotateX(${currentControls.elevation.value}deg)_rotateZ(${currentControls.rotation.value}deg)]
          [transform-style:preserve-3d]
          before:absolute before:inset-0 before:bg-black/10 before:[transform:translateZ(${currentControls.depth.value}px)]
        `
      case "flatDesign2":
        return `
          bg-white
          rounded-[${currentControls.radius.value}px]
          shadow-[0_${currentControls.elevation.value}px_${currentControls.elevation.value * 2}px_rgba(0,0,0,${currentControls.contrast.value})]
        `
      case "kineticTypography":
        return `
          bg-gray-900
          rounded-lg
          overflow-hidden
          [&_.animate-text]:animate-bounce
          [&_.animate-text]:[animation-duration:${1 / currentControls.speed.value}s]
          [&_.animate-text]:[animation-delay:calc(var(--index)_*_0.1s)]
          [&_.animate-text]:[transform:translateY(${currentControls.amplitude.value}px)]
          [&_.animate-text]:[animation-timing-function:cubic-bezier(0.${Math.floor(currentControls.frequency.value * 100)},0,0.2,1)]
        `
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Style Effects Playground</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Card */}
          <div className="space-y-8">
            <div className={`p-6 ${getStyleClasses()}`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`font-semibold ${currentStyle === "neumorphism" ? "text-gray-700" : "text-white"}`}>
                  Total Matches
                </span>
                <Filter className={currentStyle === "neumorphism" ? "text-gray-700" : "text-white"} size={16} />
              </div>
              <div className={`text-4xl font-bold ${currentStyle === "neumorphism" ? "text-gray-800" : "text-white"}`}>
                {currentStyle === "kineticTypography" ? (
                  <span className="inline-flex">
                    {"10200".split("").map((char, i) => (
                      <span key={i} className="animate-text" style={{ "--index": i } as React.CSSProperties}>
                        {char}
                      </span>
                    ))}
                  </span>
                ) : (
                  "10200"
                )}
              </div>
            </div>

            {/* Style Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(defaultControls).map((style) => (
                <button
                  key={style}
                  onClick={() => setCurrentStyle(style)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentStyle === style ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <StyleControls
            effect={currentStyle}
            controls={controls[currentStyle]}
            onControlChange={handleControlChange}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}

