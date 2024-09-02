"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface ComponentProps {
  onValueChange?: (newValue: number) => void;
  defaultValue?: number;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  onValueChange,
  defaultValue = 0,
  min = 0,
  max = Number.MAX_VALUE,
}: ComponentProps) {
  const [value, setValue] = useState<number>(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const increment = () => {
    const newValue = Math.min(max, value + 1);
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = Math.max(min, value - 1);
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      setValue(newValue);
    }
  };

  const handleInputBlur = () => {
    const clampedValue = Math.max(min, Math.min(max, value));
    if (clampedValue !== value) {
      setValue(clampedValue);
      if (onValueChange) {
        onValueChange(clampedValue);
      }
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
      increment();
    } else {
      decrement();
    }
    e.preventDefault();
  };

  useEffect(() => {
    setValue((prevValue) => Math.max(min, Math.min(max, prevValue)));
  }, [min, max]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("wheel", handleWheel);
    }
    return () => {
      if (inputElement) {
        inputElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, [value]);

  const hideArrowsStyle = `
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;

  return (
    <div className="flex items-center space-x-2">
      <style>{hideArrowsStyle}</style>
      <Button
        variant="outline"
        size="default"
        onClick={decrement}
        aria-label="Decrease value"
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        ref={inputRef}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="w-20 text-center"
        aria-label="Quantity value"
      />
      <Button
        variant="outline"
        size="default"
        onClick={increment}
        aria-label="Increase value"
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
