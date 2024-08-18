"use client";
import { useRef, useEffect } from "react";
interface Item {
    x: number;
    y: number;
    radius: number;
    speed: number;
    direction: number;
    color: string;
    spells: Spell[];
    lastShootTime: number;
    shootingInterval: number;
    shootingDirection: number;
    spellColor: string;
}

interface Spell {
    x: number;
    y: number;
    radius: number;
}
export default function TesterShooting() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const itemsRef = useRef<Item[]>([
        {
            x: 200,
            y: 200,
            radius: 50,
            speed: 1,
            direction: 1,
            color: "blue",
            spells: [],
            lastShootTime: Date.now(),
            shootingInterval: 1000,
            shootingDirection: 1,
            spellColor: "red",
        },
        {
            x: 300,
            y: 100,
            radius: 20,
            speed: 1,
            direction: 1,
            color: "red",
            spells: [],
            lastShootTime: Date.now(),
            shootingInterval: 1000,
            shootingDirection: -1,
            spellColor: "green",
        },
    ]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        const animate = () => {
            const now = Date.now();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const items = itemsRef.current;
            items.forEach((item, index) => {
                item.y += item.speed * item.direction;

                if (
                    item.y + item.radius > canvas.height ||
                    item.y - item.radius < 0
                ) {
                    item.direction *= -1;
                }

                ctx.beginPath();
                ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                if (now - item.lastShootTime >= item.shootingInterval) {
                    item.spells.push({
                        x: item.x,
                        y: item.y,
                        radius: item.radius / 5,
                    });
                    item.lastShootTime = now;
                }

                item.spells.filter((spell) => {
                    return spell.x > 0 && spell.x < canvas.width;
                });

                item.spells.forEach((spell, spellIndex) => {
                    spell.x += item.speed * 1.5 * item.shootingDirection;

                    ctx.beginPath();
                    ctx.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2);
                    ctx.fillStyle = item.spellColor;
                    ctx.fill();
                    ctx.closePath();
                });
            });

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
