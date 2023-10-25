export const convertToInteger = (s) => {
    if (typeof s === 'string') {
        if (s.slice(0, 2) === '0x') {
            return parseInt(s, 16)
        } else {
            return parseInt(s)
        }
    } else if (typeof s === 'number') {
        return s
    } else {
        throw new Error('unrecognized format for chain id')
    }
}

export const convertToString = (s) => {
    if (typeof s === 'string') {
        return s
    } else {
        return s.toString()
    }
}
