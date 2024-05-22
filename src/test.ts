
class T {
    public a: number = 23;
}

const descriptor = Object.getOwnPropertyDescriptor(T.prototype, 'a');

if (descriptor) {
    const value = descriptor.value;
    console.log(value); // 输出：23
}
console.log(descriptor)