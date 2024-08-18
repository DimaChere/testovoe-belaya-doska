"use client";
import { useRef, useEffect } from "react";

interface Item {
    x: number;
    y: number;
    radius: number;
    speed: number;
    direction: number;
}

export default function Tester() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        let item: Item = {
            x: 200,
            y: 200,
            radius: 50,
            speed: 3,
            direction: 1,
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            item.y += item.speed * item.direction;

            if (
                item.y + item.radius > canvas.height ||
                item.y - item.radius < 0
            ) {
                item.direction *= -1;
            }

            ctx.beginPath();
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            requestAnimationFrame(animate);
        };

        animate(); // Запускаем анимацию
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} width={500} height={500} />
        </div>
    );
}
