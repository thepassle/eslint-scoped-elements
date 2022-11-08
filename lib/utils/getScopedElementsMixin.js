function getScopedElementsMixin(superClass) {
    if(!superClass?.callee?.name) {
        return false;
    }
    if (superClass?.callee?.name === 'ScopedElementsMixin') {
       return true;
    } else {
        if(superClass?.arguments) {
            return getScopedElementsMixin(superClass?.arguments[0]);
        }
    }
}

module.exports = { getScopedElementsMixin };