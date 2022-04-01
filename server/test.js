function p(msg, waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { console.log(msg) }, waitTime);
    });
}

async function x() {
    const a = await (() => { setTimeout(() => { console.log('a'); resolve() }, 4000) })();
    const b = await (() => { setTimeout(() => { console.log('b'); resolve() }, 5000) })();
}

let a = undefined;

console.log(a === undefined);