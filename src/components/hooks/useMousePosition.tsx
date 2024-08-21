import { useRef, useEffect } from "react";

const useMousePosition = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const mousePositionRef = useRef<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });
    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            if (!canvasRef.current) return;

            const canvasRect = canvasRef.current.getBoundingClientRect();
            mousePositionRef.current = {
                x: ev.clientX - canvasRect.left,
                y: ev.clientY - canvasRect.top,
            };
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, [canvasRef]);
    return mousePositionRef;
};
export default useMousePosition;
