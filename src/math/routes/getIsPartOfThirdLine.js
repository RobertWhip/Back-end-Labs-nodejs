'use strict';

module.exports = { 
    handler : (request, h) => {
        const input = {} 

        Object.keys(request.params).forEach(key => Object.assign(
                input, 
                {
                    [key]: +request.params[key]
                }
            )
        );

        const {
            x1, y1,
            x2, y2,
            x3, y3,
            x4, y4,
        } = input;

        const result = { 
            isPartOfThird:
                x1/x3 === y1/y3 && x2/x4 === y2/y4,
            hasCommonPoint: 
                isInRange(x1, y1, x2, y2, x3, y3, x4, y4),
        };
        return result;
    }
};
const isInRange = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    return (y1 <= y4 && y4 <= y2 && x1 <= x3 && x3 <= x2) ||
        (y1 <= y3 && y3 <= y2 && x1 <= x4 && x4 <= x2) || 
        (y1 <= y3 && y3 <= y2 && x1 <= x3 && x3 <= x2) ||
        (y1 <= y4 && y4 <= y2 && x1 <= x4 && x4 <= x2);
}