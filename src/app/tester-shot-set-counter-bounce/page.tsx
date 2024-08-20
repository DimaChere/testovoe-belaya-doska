"use client";
import useMousePosition from "@/components/hooks/useMousePosition";
import { useRef, useEffect, useState, useCallback } from "react";

// Интерфейс для объекта Item, который представляет круг на канвасе
interface Item {
    x: number;
    y: number;
    radius: number;
    speed: number;
    direction: number;
    color: string;
    spells: Spell[]; // Массив заклинаний, которые выпускает круг
    lastShootTime: number;
    shootingInterval: number;
    shootingDirection: number;
    spellColor: string;
}

// Интерфейс для объекта Spell, который представляет заклинание, выпущенное кругом
interface Spell {
    x: number;
    y: number;
    radius: number;
}

export default function TesterShootingSettings() {
    const canvasRef = useRef<HTMLCanvasElement>(null); // Ссылка на элемент canvas
    const [items, setItems] = useState<Item[]>([
        // Начальное состояние двух кругов
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
    const itemsRef = useRef<Item[]>(items); // Ссылка на массив items для сохранения актуального состояния
    const [hitCounts, setHitCounts] = useState<number[]>([0, 0]); // Счетчики попаданий по каждому кругу
    const mousePosition = useMousePosition(); // Позиция мыши

    useEffect(() => {
        // Синхронизация актуального состояния items с itemsRef
        itemsRef.current = items;
    }, [items]);

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
                // Проверка на столкновение с курсором мыши
                if (checkCursorCollision(item)) {
                    item.direction *= -1; // Меняем направление движения
                }

                // Обновление положения круга
                item.y += item.speed * item.direction;

                // Проверка на столкновение с краями канваса
                if (
                    item.y + item.radius > canvas.height ||
                    item.y - item.radius < 0
                ) {
                    item.direction *= -1;
                }

                // Рисуем круг
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

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
                        return false; // Убираем заклинание после попадания
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

                    return true; // Оставляем заклинание на экране
                });
            });

            // Запрашиваем следующий кадр анимации
            requestAnimationFrame(animate);
        };

        animate(); // Запуск анимации
    }, [checkCursorCollision]);

    return (
        <div>
            <canvas ref={canvasRef} width={500} height={500} />
            {items.map((item, index) => (
                <div key={index} className="my-3">
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
                    <div>
                        <p>Score: {hitCounts[+!index]}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
