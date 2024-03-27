
const Cd =(target, key,value)=>{
    target.constructor['dddddd'] = 221;
}

class A {
    constructor() {
        let self: any = this;
        console.log(self.constructor.name,self.constructor['dddddd'] , this)
    }
}

class B extends A{
    @Cd
    public c() {

    }
}
new B();