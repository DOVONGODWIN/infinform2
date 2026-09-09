function timer(time_seconds, onTick) {
    let remain_time = time_seconds;
    onTick(remain_time); // affichage initial immédiat

    const intervalId = setInterval(() => { 
        remain_time--; onTick(remain_time);}, 1000);
    }

function refresh_page(time_seconds, onTick) {
    setTimeout(location.reload.bind(location), time_seconds * 1000);
    timer(time_seconds, onTick);
}

export { refresh_page };