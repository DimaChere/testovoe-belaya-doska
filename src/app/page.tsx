"use client";
import useMousePosition from "@/components/hooks/useMousePosition";
import Score from "@/components/score";
import { Item, Spell } from "@/components/types/types";
import { useRef, useEffect, useState, useCallback } from "react";

export default function Game() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [items, setItems] = useState<Item[]>([
        {
            x: 60,
            y: 200,
            radius: 50,
            speed: 1,
            direction: 1,
            color: "rgb(0, 0, 255)",
            spells: [],
            lastShootTime: Date.now(),
            shootingInterval: 1000,
            shootingDirection: 1,
            spellColor: "rgb(250,0,0)",
        },
        {
            x: 450,
            y: 100,
            radius: 20,
            speed: 1,
            direction: 1,
            color: "rgb(255, 0, 0)",
            spells: [],
            lastShootTime: Date.now(),
            shootingInterval: 150,
            shootingDirection: -1,
            spellColor: "rgb(0,0,250)",
        },
    ]);
    const itemsRef = useRef<Item[]>(items);
    const [hitCounts, setHitCounts] = useState<number[]>([0, 0]);
    const mousePosition = useMousePosition(canvasRef);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
        null
    );

    // Обработка изменения скорости для определенного круга
    const handleSpeedChange = (index: number, newSpeed: number) => {
        const updatedItems = [...itemsRef.current];
        updatedItems[index].speed = newSpeed;
        setItems(updatedItems);
    };

    // Обработка изменения интервала стрельбы для определенного круга
    const handleShootingIntervalChange = (
        index: number,
        newInterval: number
    ) => {
        const updatedItems = [...itemsRef.current];
        updatedItems[index].shootingInterval = newInterval;
        setItems(updatedItems);
    };

    // Обработка изменения цвета заклинаний для определенного круга
    const handleSpellColorChange = (index: number, newColor: string) => {
        const updatedItems = [...itemsRef.current];
        updatedItems[index].spellColor = newColor;
        setItems(updatedItems);
    };

    // Проверка коллизии между заклинанием и целью (другим кругом)
    const checkCollision = (spell: Spell, target: Item) => {
        const dx = spell.x - target.x;
        const dy = spell.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < spell.radius + target.radius;
    };

    // Проверка коллизии круга с курсором мыши
    const checkCursorCollision = useCallback(
        (item: Item) => {
            const { x, y } = mousePosition.current;
            const dx = Math.abs(x - item.x);
            const dy = Math.abs(y - item.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance <= item.radius;
        },
        [mousePosition]
    );

    // Обработка клика по canvas
    const handleCanvasClick = useCallback((event: MouseEvent) => {
        const { offsetX, offsetY } = event;
        const clickedIndex = itemsRef.current.findIndex(
            (item) =>
                Math.sqrt((offsetX - item.x) ** 2 + (offsetY - item.y) ** 2) <=
                item.radius
        );

        if (clickedIndex !== -1) {
            setSelectedItemIndex(clickedIndex);
        } else {
            setSelectedItemIndex(null);
        }
    }, []);

    useEffect(() => {
        // Синхронизация актуального состояния items с itemsRef
        itemsRef.current = items;
    }, [items]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener("click", handleCanvasClick);

        return () => {
            canvas.removeEventListener("click", handleCanvasClick);
        };
    }, [handleCanvasClick]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        // Функция анимации
        const animate = () => {
            const now = Date.now();

            // Очистка канваса перед каждым кадром
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Обработка каждого круга
            itemsRef.current.forEach((item, index) => {
                if (checkCursorCollision(item)) {
                    item.direction *= -1;
                }

                item.y += item.speed * item.direction;

                // Проверка на столкновение с краями канваса
                if (
                    item.y + item.radius > canvas.height ||
                    item.y - item.radius < 0
                ) {
                    item.direction *= -1;
                }

                // Создаем новое заклинание, если прошло достаточно времени с момента последнего выстрела
                if (now - item.lastShootTime >= item.shootingInterval) {
                    item.spells.push({
                        x: item.x,
                        y: item.y,
                        radius: item.radius / 5,
                    });
                    item.lastShootTime = now;
                }

                // Обработка всех заклинаний круга
                item.spells = item.spells.filter((spell) => {
                    spell.x += 3 * item.shootingDirection;

                    const targetIndex = index === 0 ? 1 : 0;

                    // Проверка на попадание в другой круг
                    if (checkCollision(spell, itemsRef.current[targetIndex])) {
                        setHitCounts((prev) => {
                            const newHitCounts = [...prev];
                            newHitCounts[targetIndex]++;
                            return newHitCounts;
                        });
                        return false;
                    }

                    // Убираем заклинание, если оно вышло за пределы канваса
                    if (spell.x < 0 || spell.x > canvas.width) {
                        return false;
                    }

                    // Рисуем заклинание
                    ctx.beginPath();
                    ctx.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2);
                    ctx.fillStyle = item.spellColor;
                    ctx.fill();
                    ctx.closePath();

                    return true;
                });

                // Рисуем круг
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            });

            // Запрашиваем следующий кадр анимации
            requestAnimationFrame(animate);
        };

        animate(); // Запуск анимации
    }, [checkCursorCollision]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-300">
            <canvas ref={canvasRef} width={500} height={500} />
            <Score hitCounts={hitCounts} />
            <div className="flex gap-10">
                {items.map((item, index) => (
                    <div key={index}>
                        <div>
                            <label>Speed: {item.speed}</label>
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
                            <label>
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
                    </div>
                ))}
            </div>

            {selectedItemIndex !== null && (
                <div className="flex items-center px-9 py-10 rounded-3xl bg-[#6d6d6d85]">
                    <div className="h-10 w-10 overflow-hidden rounded-full inline-flex items-center relative">
                        <input
                            type="color"
                            value={items[selectedItemIndex].spellColor}
                            onChange={(e) =>
                                handleSpellColorChange(
                                    selectedItemIndex,
                                    e.target.value
                                )
                            }
                            className="absolute h-16 w-16 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-none m-0 p-0 cursor-pointer appearance-none"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}
