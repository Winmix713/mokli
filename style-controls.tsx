"use client"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface StyleControlsProps {
  effect: string
  controls: {
    [key: string]: {
      value: number
      min: number
      max: number
      step: number
    }
  }
  onControlChange: (control: string, value: number) => void
}

export default function StyleControls({ effect, controls, onControlChange }: StyleControlsProps) {
  const getCSSString = () => {
    const currentControls = controls

    switch (effect) {
      case "glassmorphism":
        return `/* Glassmorphism */
background: rgba(255, 255, 255, ${currentControls.transparency.value});
backdrop-filter: blur(${currentControls.blur.value}px);
-webkit-backdrop-filter: blur(${currentControls.blur.value}px);
border: ${currentControls.outline.value}px solid rgba(255, 255, 255, 0.3);`
      case "neumorphism":
        return `/* Neumorphism */
background: #e0e0e0;
border-radius: ${currentControls.radius.value}px;
box-shadow: ${currentControls.distance.value}px ${currentControls.distance.value}px ${currentControls.elevation.value}px rgba(0,0,0,${currentControls.intensity.value}),
            -${currentControls.distance.value}px -${currentControls.distance.value}px ${currentControls.elevation.value}px rgba(255,255,255,0.8);`
      // Add more cases for other effects...
      default:
        return `/* ${effect} */\n/* Custom CSS for selected effect */`
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCSSString())
  }

  return (
    <div className="p-6 rounded-lg bg-white/10 backdrop-blur-md">
      <div className="space-y-6">
        {Object.entries(controls).map(([name, control]) => (
          <div key={name} className="space-y-2">
            <label className="text-white uppercase text-sm font-medium">{name}</label>
            <Slider
              value={[control.value]}
              min={control.min}
              max={control.max}
              step={control.step}
              onValueChange={([value]) => onControlChange(name, value)}
              className="w-full"
            />
          </div>
        ))}

        <div className="space-y-2">
          <label className="text-white uppercase text-sm font-medium">CSS</label>
          <div className="relative">
            <pre className="bg-black/20 p-4 rounded-lg text-white text-sm overflow-x-auto">{getCSSString()}</pre>
            <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

