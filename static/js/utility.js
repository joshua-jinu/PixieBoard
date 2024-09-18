import Point from '/js/mouse_point_module.js';

export function getMouseCoordsOnWhiteboard(e, whiteboard){
    let rect = whiteboard.getBoundingClientRect();
    let x= e.clientX - rect.left;
    let y= e.clientY - rect.top;
    return new Point(x, y);
}

export function radiusCalculate(startpoint, endpoint){
    let exp1 = Math.pow(endpoint.x - startpoint.x, 2);
    let exp2 = Math.pow(endpoint.y - startpoint.y, 2);
    let radius = Math.sqrt(exp1 + exp2)
    return radius 
}