let appConfig = {
    ver: 20251120,
    title: 'xpgys',
    site: 'http://www.xpgys.com',
    tabs: [
        { name: '首頁', ext: { id: 'home' } },
        { name: '電影', ext: { id: 'dianying' } },
        { name: '電視劇', ext: { id: 'dianshiju' } },
        { name: '動漫', ext: { id: 'dongman' } },
        { name: '綜藝', ext: { id: 'zongyi' } },
        { name: '紀錄片', ext: { id: 'jilupian' } },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = JSON.parse(ext)
    let cards = []
    let { id, page = 1 } = ext

    if (id === 'home') {
        // 首页获取最新视频
        let url = `${appConfig.site}/index.php/index/index/vod.html?page=${page}`
        const { data } = await $fetch.get(url)
        
        // 解析HTML获取视频列表
        let $ = cheerio.load(data)
        $('.stui-vodlist__box').each((i, elem) => {
            let $elem = $(elem)
            let name = $elem.find('.title').text().trim()
            let pic = $elem.find('.lazyload').attr('data-original')
            let id = $elem.find('a').attr('href').match(/\/(\d+)\.html/)[1]
            let remarks = $elem.find('.pic-text').text().trim()
            
            cards.push({
                vod_id: id,
                vod_name: name,
                vod_pic: pic.startsWith('http') ? pic : appConfig.site + pic,
                vod_remarks: remarks,
                ext: { id: id }
            })
        })
    } else {
        // 分类页面
        let url = `${appConfig.site}/index.php/vod/show/id/${id}/page/${page}.html`
        const { data } = await $fetch.get(url)
        
        let $ = cheerio.load(data)
        $('.stui-vodlist__box').each((i, elem) => {
            let $elem = $(elem)
            let name = $elem.find('.title').text().trim()
            let pic = $elem.find('.lazyload').attr('data-original')
            let id = $elem.find('a').attr('href').match(/\/(\d+)\.html/)[1]
            let remarks = $elem.find('.pic-text').text().trim()
            
            cards.push({
                vod_id: id,
                vod_name: name,
                vod_pic: pic.startsWith('http') ? pic : appConfig.site + pic,
                vod_remarks: remarks,
                ext: { id: id }
            })
        })
    }

    return JSON.stringify({ list: cards })
}

async function getTracks(ext) {
    ext = JSON.parse(ext)
    let list = []
    let id = ext.id
    let url = `${appConfig.site}/index.php/vod/detail/id/${id}.html`

    const { data } = await $fetch.get(url)
    let $ = cheerio.load(data)
    
    // 获取播放源
    $('.stui-content__playlist').each((sourceIndex, sourceElem) => {
        let $source = $(sourceElem)
        let title = $source.find('h3').text().trim()
        let tracks = []
        
        $source.find('li a').each((trackIndex, trackElem) => {
            let $track = $(trackElem)
            let name = $track.text().trim()
            let playUrl = $track.attr('href')
            
            tracks.push({
                name: name,
                ext: { 
                    url: playUrl,
                    id: id
                }
            })
        })
        
        if (tracks.length > 0) {
            list.push({
                title: title,
                tracks: tracks
            })
        }
    })

    return JSON.stringify({ list: list })
}

async function getPlayinfo(ext) {
    ext = JSON.parse(ext)
    let { url, id } = ext
    
    // 获取播放页面的真实播放地址
    let playPageUrl = url.startsWith('http') ? url : appConfig.site + url
    const { data } = await $fetch.get(playPageUrl)
    
    // 解析播放地址
    let playUrl = ''
    let match = data.match(/player_aaaa\s*=\s*["']([^"']+)["']/)
    if (match) {
        playUrl = match[1]
    }
    
    let header = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': appConfig.site
    }

    return JSON.stringify({ 
        urls: [playUrl], 
        headers: [header] 
    })
}

async function search(ext) {
    ext = JSON.parse(ext)
    let cards = []

    const text = encodeURIComponent(ext.text)
    const page = ext.page || 1
    const url = `${appConfig.site}/index.php/vod/search.html?wd=${text}&page=${page}`

    const { data } = await $fetch.get(url)
    let $ = cheerio.load(data)
    
    $('.stui-vodlist__box').each((i, elem) => {
        let $elem = $(elem)
        let name = $elem.find('.title').text().trim()
        let pic = $elem.find('.lazyload').attr('data-original')
        let id = $elem.find('a').attr('href').match(/\/(\d+)\.html/)[1]
        let remarks = $elem.find('.pic-text').text().trim()
        
        cards.push({
            vod_id: id,
            vod_name: name,
            vod_pic: pic.startsWith('http') ? pic : appConfig.site + pic,
            vod_remarks: remarks,
            ext: { id: id }
        })
    })

    return JSON.stringify({ list: cards })
}

function getHeader() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': appConfig.site
    }
}
