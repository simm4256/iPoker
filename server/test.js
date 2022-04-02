const aaa = 'aaa';
let fn = async () => {
    const a = await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(aaa);
            resolve();
        }, 1000);
    });
    const b = await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(aaa);
            resolve();
        }, 1000);
    });
}

fn();