// Интерфейс для объекта Item, который представляет круг на канвасе
export interface Item {
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
export interface Spell {
    x: number;
    y: number;
    radius: number;
}
