
marqueeTimer = null;
exports.init = (client, status_texts=[
    "Turk programcılar sunucusuna hoşgeldiniz!",
    "Hemen bugün programlama öğrenmeye başla!"]) => {
    // prevent marquee timer from toggling more than once
    if (false && marqueeTimer)
    return;
    // marquee status, this also prevents heroku dyno from sleeping
    let   mi = 0;  // marquee index
    const mm = status_texts;
    const ml = mm.length;
    const marqueeStatus = () =>
    mi != ml-1 ? mm[++mi]
            : mm[mi=0];

    const setStatus = () => client.user.setActivity(marqueeStatus());
    setStatus();
    marqueeTimer = setInterval(setStatus, 10000*(1+Math.random()));
}