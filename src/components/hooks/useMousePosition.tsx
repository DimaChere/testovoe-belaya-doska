import { useRef, useEffect } from "react";

const useMousePosition = () => {
    const mousePositionRef = useRef<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });
    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            mousePositionRef.current = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);
    return mousePositionRef;
};
export default useMousePosition;
