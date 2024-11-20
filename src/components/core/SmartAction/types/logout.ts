export default (params: any, callback?: Function, errorBack?: Function) => {
    document.cookie = '__token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/; domain=.anyhubs.com;' 
    window.location.href = '/login'
}