//export function parseBoolean(v: any) {
//    if (typeof v == 'boolean') {
//        return v;
//    }
//    if (typeof v == 'string') {
//        let value = v.trim().toLocaleLowerCase();
//        return value == 'true';
//    }
//    if (Object.prototype.toString.call(v) == '[object Array]') {
//        return v.length > 0;
//    }
//    return false;
//}