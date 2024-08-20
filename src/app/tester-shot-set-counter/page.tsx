"use client";
import { useRef, useEffect, useState } from "react";
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
export default function TesterShootingSettings() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [items, setItems] = useState<Item[]>([
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
            shootingInterval: 150,
            shootingDirection: -1,
            spellColor: "green",
        },
    ]);

    const itemsRef = useRef<Item[]>(items);

    const [hitCounts, setHitCounts] = useState<number[]>([0, 0]);
    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const handleSpeedChange = (index: number, newSpeed: number) => {
        const updatedItems = [...itemsRef.current];
        updatedItems[index].speed = newSpeed;
        setItems(updatedItems);
    };

    const handleShootingIntervalChange = (
        index: number,
        newInterval: number
    ) => {
        const updatedItems = [...itemsRef.current];
        updatedItems[index].shootingInterval = newInterval;
        setItems(updatedItems);
    };

    const checkCollision = (spell: Spell, target: Item) => {
        const dx = spell.x - target.x;
        const dy = spell.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < spell.radius + target.radius;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        const animate = () => {
            const now = Date.now();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            itemsRef.current.forEach((item, index) => {
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

                item.spells = item.spells.filter((spell) => {
                    spell.x += 3 * item.shootingDirection;

                    const targetIndex = index === 0 ? 1 : 0;

                    if (checkCollision(spell, itemsRef.current[targetIndex])) {
                        setHitCounts((prev) => {
                            const newHitCounts = [...prev];
                            newHitCounts[targetIndex]++;
                            return newHitCounts;
                        });
                        return false;
                    }

                    if (spell.x < 0 || spell.x > canvas.width) {
                        return false;
                    }

                    ctx.beginPath();
                    ctx.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2);
                    ctx.fillStyle = item.spellColor;
                    ctx.fill();
                    ctx.closePath();

                    return true;
                });
            });

            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} width={500} height={500} />
            {items.map((item, index) => (
                <div key={index} className="my-3">
                    <div>
                        <label htmlFor="">Speed: {item.speed}</label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={item.speed}
                            onChange={(e) =>
                                handleSpeedChange(index, +e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label htmlFor="">
                            Shooting Interval: {item.shootingInterval}
                        </label>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            value={item.shootingInterval}
                            onChange={(e) => {
                                handleShootingIntervalChange(
                                    index,
                                    +e.target.value
                                );
                            }}
                        />
                    </div>
                    <div>
                        <p>Score: {hitCounts[index]}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
