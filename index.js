const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const db = require('./config')
const moment = require('moment')
moment.locale('th')
const path = require("path")
const port = process.env.PORT || 5003
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const cron = require('node-cron')
const fs = require('fs');
const { now } = require('moment')
const { registerFont, createCanvas, loadImage } = require("canvas");
registerFont('./font/THSarabun Bold.ttf', { family: 'THSarabun' })
app.use("/images", express.static(path.join(__dirname, "images")))
const ping = require('ping');
const token = '7aCy9SqzcUVgmv6mqcibTIA4EZ8s2TrbqXE4vnQz95mCdW+z9aIQjDeyCKSL11RhUjREJnRetPSIFCu/U17NA8oDyXj8AT0oD4B92GDytXXj2rVN8XQMteuleyz6Wx4RsOR5Ggt1rs3qQvDqXcg8ggdB04t89/1O/w1cDnyilFU='
const token_group_line ='tsC5SYKialkyXj3UDrnwA8ck3FSk9qDKEQXBzdTyRzo'
//reply
app.post('/webhook', (req, res) => {
    let message = ''
    let tdate = ''
    let reply_token = req.body.events[0].replyToken
    let userId = ''
    console.log(req.body.events[0])
    if (req.body.events[0].type == 'message') {
        message = req.body.events[0].message.text
        userId = req.body.events[0].source.userId

    } else if (req.body.events[0].type == 'postback') {
        tdate = moment(req.body.events[0].postback.params.datetime).format('YYYY-MM-DD')
        message = 'date'
        console.log(req.body.events[0])
    }


    if (message == 'เบอร์โทร') {
        reply(reply_token, 1)
    } else if (message == 'คลินิกให้บริการ') {
        reply(reply_token, 2, '')
    } else if (message == 'อัตราค่าห้องพิเศษ') {
        reply(reply_token, 3, '')
    } else if (message == 'ถามตอบ') {
        reply(reply_token, 5, '')
    } else {
        reply(reply_token, 4, '')
    }

    res.sendStatus(200)
})

app.get('/rely_m/:user_id', async (req, res) => {
    let user_id = req.params.user_id
    let data = {
        to: user_id,
        messages: [
            {
                type: 'text',
                text: `ส่งเรื่องเรียบร้อยแล้ว`
            }
        ]
    }
    request({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer {${token}}`
        },
        url: 'https://api.line.me/v2/bot/message/push',
        method: 'POST',
        body: data,
        json: true
    }, async function (err, res, body) {
        if (err) console.log(err)
        if (res) {
            console.log('success')
        }
        if (body) console.log(body)
    })


})


app.get('/alert-confirm/:id', async (req, res) => {
    let id = req.params.id
    let boss_comment = ''
    let user_id = ''

    console.log(id)

    try {
        let sql = ` SELECT * FROM complain_head  WHERE id = '${id}'`
        db.query(sql, (err, row) => {
            if (err) return console.log(err)
            console.log(row)
            boss_comment = row[0].boss_comment
            user_id = row[0].user_id
            reply_user(boss_comment, user_id)
        })
    } catch (error) {
        console.log(error)
    }




    const reply_user = (boss_comment, user_id) => {
        console.log(boss_comment, user_id)

        let data = {
            to: user_id,
            messages: [
                {
                    type: 'text',
                    text: `ชี้แจ้ง : ${boss_comment}`
                }
            ]
        }

        console.log(data)
        request({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer {${token}}`
            },
            url: 'https://api.line.me/v2/bot/message/push',
            method: 'POST',
            body: data,
            json: true
        }, async function (err, res, body) {
            if (err) console.log(err)
            if (res) {
                console.log('success')

            }
            if (body) console.log(body)
        })

    }


    res.send({ 'status': 'OK' })
    // console.log(response)
    // if (response.rows.length > 0) {
    //     console.log(response.rows[0])
    //     boss_comment = response.rows[0].boss_comment
    //     user_id = response.rows[0].user_id
    // }




})


app.get('/test2', async (req, res) => {


    console.log('test')

    // const a = await queryProfile('U2c04ba314d6649a7f6f2cc3b554b0ad9')
    // console.log(a)


    // fs.unlinkSync( `./images/${d.vn_reserve}.png`)
    // fs.unlink(`./images/20220606112157.png`, function (err) {
    //     if (err) console.log(err);
    //     // if no error, file has been deleted successfully
    //     console.log('File deleted!');
    // });
    // let sql = `SELECT nextdate,d.id,d.name as dname,count(vn_reserve) AS tcount 
    // FROM diligent_queue_dep d
    // LEFT JOIN diligent_queue_reserve r ON r.dep::int = d.id AND nextdate = '2022-06-21'
    // GROUP BY nextdate,d.id,dname
    // ORDER BY d.id   `
    // const response = await db.query(sql);
    // if (response.rows.length > 0) {
    //     console.log(response.rows)
    //     createImageDoctor(response.rows)

    // }
})
// test push
app.get('/test', async (req, res) => {

    let sql = `SELECT qr.*,r.user_id,tel,r.cid,d.name AS dname,concat(p.fname,' ',p.lname) as tname
    FROM diligent_queue_reserve qr
    LEFT JOIN patient p ON p.hn = qr.hn
    LEFT JOIN diligent_queue_register  r ON r.cid = p.cid
    LEFT JOIN diligent_queue_dep d ON d.id = qr.dep::int
    where to_char(nextdate - INTERVAL '1 DAY', 'YYYY-mm-dd') = to_char(CURRENT_DATE,'YYYY-mm-dd')      `

    // con.query(" SELECT * FROM amulet  WHERE id = ? ", [id], function (err, results) {
    const a = await db.query('SELECT 1');
    console.log(a)
    // const response = await db.query(sql);
    // console.log(response)
    // if (response.rows.length > 0) {
    //     response.rows.map((item, i) => {
    //         console.log(item)
    //         createImage(item)
    //     })
    // }

    res.sendStatus(200)
})


// cron.schedule('*/30 * * * * *', async function () {
//     pingT()
// })
//**** ด่วน 3 วัน   9 โมง */
cron.schedule('01 00 09 * * *', async function () {
    let DateTimeCur = new Date();
    let curdate = moment(DateTimeCur).format("YYYY-MM-DD")
    let curdate_tmp = moment(DateTimeCur).format("HH:mm:ss")
    let timeC = moment(DateTimeCur).format("HH:mm")
    let sql = `SELECT h.id,dt.name ,urgency_class,DATE_FORMAT(staff_upDt, "%Y-%m-%d") as tdate,count(d.id) AS tcount,DATEDIFF(CURRENT_DATE,DATE_FORMAT(staff_upDt, "%Y-%m-%d")) as tday,h.no
    FROM complain_detail d 
    LEFT JOIN complain_head h  ON h.id = complain_head_id
    LEFT JOIN dept   dt  ON dt.id = d.dept_id
    LEFT JOIN complain_type t ON t.id = d.type_complain_id
    WHERE  dept_upDt is NULL AND  urgency_class ='1'  AND t.status = '1'
    GROUP BY dt.name ,urgency_class,dept_id 
    HAVING tday > 3   `

    db.query(sql, (err, row) => {
        if (err) return console.log(err)
        if (row.length > 0) {
            let message = '***ด่วน เกิน 3 วัน***\nหน่วยงานที่ยังไม่ได้ชี้แจง\n'
            row.map((item, i) => {
                message = message + (i+1) +'. ' + item.name + ' ' + item.tcount + ' เรื่อง (' + item.no  + ')\n\n'
            })
            message = message + 'https://admin-sswcenter.diligentsoftinter.com'
            sendMeassage(message)
        }
    })


});


//**** ไม่ด่วน 7 วัน 9 โมง */
cron.schedule('05 00 09 * * *', async function () {
    let DateTimeCur = new Date();
    let curdate = moment(DateTimeCur).format("YYYY-MM-DD")
    let curdate_tmp = moment(DateTimeCur).format("HH:mm:ss")
    let timeC = moment(DateTimeCur).format("HH:mm")
    let sql = `SELECT h.id,dt.name ,urgency_class,DATE_FORMAT(staff_upDt, "%Y-%m-%d") as tdate,count(d.id) AS tcount,DATEDIFF(CURRENT_DATE,DATE_FORMAT(staff_upDt, "%Y-%m-%d")) as tday,h.no
    FROM complain_detail d 
    LEFT JOIN complain_head h  ON h.id = complain_head_id
    LEFT JOIN dept   dt  ON dt.id = d.dept_id
    LEFT JOIN complain_type t ON t.id = d.type_complain_id
    WHERE  dept_upDt is NULL AND  urgency_class ='2'  AND t.status = '1'
    GROUP BY dt.name ,urgency_class,dept_id 
    HAVING tday > 7   `

    db.query(sql, (err, row) => {
        if (err) return console.log(err)
        if (row.length > 0) {
            let message = '***ไม่ด่วน เกิน 7 วัน***\nหน่วยงานที่ยังไม่ได้ชี้แจง\n'
            row.map((item, i) => {
                message = message + (i+1) +'. ' + item.name + ' ' + item.tcount + ' เรื่อง (' + item.no  + ')\n\n'
            })
            message = message + 'https://admin-sswcenter.diligentsoftinter.com'
            sendMeassage(message)
        }
    })


});


function sendMeassage(message) {
    console.log(message)
    try {
        request({
            method: 'POST',
            uri: "https://notify-api.line.me/api/notify",
            header: {
                'Content-Type': 'multipart/form-data',
            },
            auth: {
                bearer: token_group_line,
            },
            form: {
                message: message
            },
        }, (err, httpResponse, body) => {
            if (err) {
                console.log(err)
            } else {
                console.log(body)
            }
        });

    } catch (error) {
        console.log(error)
    }
}
// cron.schedule('* 36 21 * * *', function(){
//     console.log(new Date().toLocaleString());
// });


// ส่งเตือนนัด
// update opdscreen
cron.schedule('10 30 12 * * *', async function () {

    // let DateTimeCur = new Date();
    // let curdate = moment(DateTimeCur).format("YYYY-MM-DD")
    // let curdate_tmp = moment(DateTimeCur).format("HH:mm:ss")
    // let timeC = moment(DateTimeCur).format("HH:mm")
    // let sql = `SELECT qr.*,r.user_id,tel,r.cid,d.name AS dname,concat(p.fname,' ',p.lname) as tname
    //         FROM diligent_queue_reserve qr
    //         LEFT JOIN patient p ON p.hn = qr.hn
    //         LEFT JOIN diligent_queue_register  r ON r.cid = p.cid
    //         LEFT JOIN diligent_queue_dep d ON d.id = qr.dep::int
    //         where to_char(nextdate - INTERVAL '1 DAY', 'YYYY-mm-dd') = to_char(CURRENT_DATE,'YYYY-mm-dd')      `
    // const response = await db.query(sql);
    // if (response.rows.length > 0) {
    //     response.rows.map((item, i) => {
    //         createImage(item)
    //     })
    // }
});
//////// end



app.listen(port)

// สร้างบัตรนัด
function createImage(data) {
    console.log('3')

    var fileName = './images/appcard.jpeg';
    var imageCaption = 'Image caption';
    var loadedImage;


    const width = 400;
    const height = 550;
    const canvas = createCanvas(width, height);

    const context = canvas.getContext("2d");
    context.fillStyle = "yellow";
    context.fillRect(0, 0, width, height);


    context.fillStyle = "#000";
    context.font = "THSarabun";
    context.textAlign = "center";
    context.fillText("Hello, World!", 400, 120);

    context.fillStyle = "#fff";
    context.fillRect(400, 200, 300, 200);

    loadImage(fileName).then((image) => {

        context.drawImage(image, 0, 0);
        context.fillStyle = "#FFF";
        context.font = "20px THSarabun";
        context.textAlign = "Left";
        context.fillText(`บัตรนัดโรงพยาบาลศรีสังวรสุโขทัย`, 280, 30);
        context.fillText(`SrisangwornSMC`, 325, 50);
        context.font = "30px THSarabun";
        context.fillStyle = "#000";
        context.fillText(`ชื่อ-สกุล : ${data.tname}`, 220, 270);
        context.fillText(`HN : ${data.hn}`, 220, 310);
        context.fillText(`วันที่นัด : ${moment(data.nextdate).add(543, 'year').format('LL')}`, 220, 350);
        context.fillText(`แผนก : ${data.dname}`, 220, 390);

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(`./images/${data.vn_reserve}.png`, buffer);
    });

    sendText(data)

}
// สร้างรายการจำนวนนัด
// async function createImageDoctor(tdate) {
//     console.log('3')

// let data

// let sql = `SELECT nextdate,d.id,d.name as dname,count(vn_reserve) AS tcount 
// FROM diligent_queue_dep d
// LEFT JOIN diligent_queue_reserve r ON r.dep::int = d.id AND nextdate = '${tdate}'
// GROUP BY nextdate,d.id,dname
// ORDER BY d.id   `
// const response = await db.query(sql);
// if (response.rows.length > 0) {
//     console.log(response.rows)
//     data = response.rows
//     // createImageDoctor(response.rows)
// }

// var fileName = './images/doctor_app.png';
// var imageCaption = 'Image caption';
// var loadedImage;


// const width = 300;
// const height = 250;
// const canvas = createCanvas(width, height);

// const context = canvas.getContext("2d");
// context.fillStyle = "yellow";
// context.fillRect(0, 0, width, height);


// context.fillStyle = "#000";
// context.font = "THSarabun";
// context.textAlign = "center";
// context.fillText("Hello, World!", 400, 120);

// context.fillStyle = "#fff";
// context.fillRect(400, 200, 300, 200);

// loadImage(fileName).then((image) => {

//     context.drawImage(image, 0, 0);
//     context.fillStyle = "#000";
//     context.font = "18px THSarabun";
//     context.textAlign = "left";
//     context.fillText(`วันที่ 21 มิย. 2564`, 95, 60);
//     // context.fillText(`SrisangwornSMC`, 325, 50);
//     context.font = "20px THSarabun";
//     context.fillStyle = "#000";

//     let theigth = 75
//     data.map((item, i) => {
//         theigth = theigth +25
//         return context.fillText(`${i + 1}.${item.dname}  จำนวน ${item.tcount} คน`, 50, theigth,);

//     })

//     // context.fillText(`1.โสต ศอ นาสิก  จำนวน 3 คน`, 50, 100,);
//     // context.fillText(`2.จักษุวิทยา  จำนวน 13 คน`, 50, 125);
//     // context.fillText(`3.ออร์โธปิดิกส์  จำนวน 3 คน`, 50, 150);
//     // context.fillText(`4.ศัลยกรรม  จำนวน 3 คน`, 50, 175);
//     // context.fillText(`5.สูตินรีเวช  จำนวน 3 คน`, 50, 200);
//     // context.fillText(`HN : ${data.hn}`, 220, 310);
//     // context.fillText(`วันที่นัด : ${moment(data.nextdate).add(543, 'year').format('LL')}`, 220, 350);
//     // context.fillText(`แผนก : ${data.dname}`, 220, 390);

//     const buffer = canvas.toBuffer("image/png");
//     fs.writeFileSync(`./images/d.png`, buffer);
// });


//     let data2 = {
//         "type": "image",
//         "originalContentUrl": `https://linebot-swhospital.diligentsoftinter.com/images/d.png`,
//         "previewImageUrl": `https://linebot-swhospital.diligentsoftinter.com/images/d.png`
//     }



//     return data2


// }

// ตอบ reply
async function reply(reply_token, type, date) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer {${token}}`
    }
    let reply_tmp
    if (type == 1) {
        // reply_tmp = [flexMulti()]
        reply_tmp = [imageTel()]
    } else if (type == 2) {
        // reply_tmp = [imageList1(), imageList2()]
        reply_tmp = [Warning()]
    } else if (type == 3) {
        reply_tmp = [imageRoom()]
    } else if (type == 5) {
        reply_tmp = [datePicker()]
    } else if (type == 6) {
        reply_tmp = [imageDoctor(date)]
    } else if (type == 7) {
        reply_tmp = [await profile(date)]
    } else {
        reply_tmp = [other()]
    }

    console.log(reply_tmp)
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: reply_tmp
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        // console.log(res);
    });


}





//push message
async function sendText(d) {
    let data = {
        to: d.user_id,
        messages: [
            imageAlertOapp(d.vn_reserve)

            // flexMulti() 
        ]
    }
    request({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer {${token}}`
        },
        url: 'https://api.line.me/v2/bot/message/push',
        method: 'POST',
        body: data,
        json: true
    }, async function (err, res, body) {
        if (err) console.log('error')
        if (res) {
            console.log('success')

            // await sleep(5000);
            // fs.unlink(`./images/${d.vn_reserve}.png`, function (err) {
            //     if (err) console.log(err);
            //     // if no error, file has been deleted successfully
            //     console.log('File deleted!');
            // });
            // console.log('xxx');
        }
        if (body) console.log(body)
    })


}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function queryProfile(userId) {
    let sql = `SELECT r.cid,r.tel,r.picture,
    concat(p.pname,p.fname,' ',p.lname) AS tname,
    p.hn,to_char(CURRENT_DATE,'YYYY')::int - to_char(p.birthday,'YYYY')::int AS tage
    FROM diligent_queue_register r
    LEFT JOIN patient p ON p.cid = r.cid
    WHERE user_id ='${userId}'  limit 1   `
    const response = await db.query(sql);
    if (response.rows.length > 0) {
        return response.rows[0]
    }
}



const profile = async (userId) => {

    // let tname =''
    // var tmp

    const d = await queryProfile(userId)

    // console.log('------')
    console.log(d)
    // console.log('profile')
    let cid = d.cid.substring(0, 6) + "xxxxx" + d.cid.substring(11, 13)

    let data = {
        "type": "flex",
        "altText": "ข้อมูลส่วนตัว",
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                    {
                        "type": "image",
                        "url": "https://sv1.picz.in.th/images/2021/08/03/2QuP1Z.png",
                        "size": "full",
                        "aspectRatio": "20:13",
                        "aspectMode": "cover",
                        "animated": true
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "image",
                                "url": d.picture,
                                "size": "full"
                            }
                        ],
                        "width": "100px",
                        "height": "100px",
                        "cornerRadius": "150px",
                        "position": "absolute",
                        "offsetStart": "100px",
                        "offsetTop": "130px",
                        "borderWidth": "3px",
                        "borderColor": "#000000"
                    },
                    {
                        "type": "text",
                        "text": d.tname,
                        "size": "lg",
                        "weight": "bold",
                        "margin": "50px",
                        "wrap": true,
                        "align": "center",
                        "color": "#be7c4d"
                    },
                    {
                        "type": "text",
                        "text": d.hn,
                        "size": "lg",
                        "weight": "bold",
                        "margin": "10px",
                        "wrap": true,
                        "align": "center",
                        "color": "#be7c4d"
                    },
                    {
                        "type": "text",
                        "text": cid,
                        "size": "lg",
                        "weight": "bold",
                        "margin": "10px",
                        "wrap": true,
                        "align": "center",
                        "color": "#be7c4d"
                    },
                    {
                        "type": "text",
                        "text": "อายุ " + d.tage + " ปี",
                        "size": "lg",
                        "weight": "bold",
                        "margin": "10px",
                        "wrap": true,
                        "align": "center",
                        "color": "#be7c4d"
                    },
                    // {
                    //     "type": "box",
                    //     "layout": "vertical",
                    //     "spacing": "sm",
                    //     "contents": [
                    //         {
                    //             "type": "box",
                    //             "layout": "baseline",
                    //             "contents": [
                    //                 // {
                    //                 //     "type": "icon",
                    //                 //     "url": "https://media-public.canva.com/Kt-FM/MADIT2Kt-FM/2/tl.png",
                    //                 //     "offsetTop": "5px"
                    //                 // },
                    //                 {
                    //                     "type": "text",
                    //                     "text": "จำนวนการจอง",
                    //                     "weight": "bold",
                    //                     "margin": "sm",
                    //                     "flex": 0,
                    //                     "color": "#ffffff"
                    //                 },
                    //                 {
                    //                     "type": "text",
                    //                     "text": "300",
                    //                     "align": "end",
                    //                     "color": "#daff7d",
                    //                     "weight": "bold"
                    //                 }
                    //             ]
                    //         },
                    //         {
                    //             "type": "box",
                    //             "layout": "baseline",
                    //             "contents": [
                    //                 {
                    //                     "type": "icon",
                    //                     "url": "https://media-public.canva.com/AwS70/MAE0wAAwS70/1/tl.png",
                    //                     "offsetTop": "6px"
                    //                 },
                    //                 {
                    //                     "type": "text",
                    //                     "text": "ยอดการแชร์กิจกรรม",
                    //                     "weight": "bold",
                    //                     "margin": "sm",
                    //                     "flex": 0,
                    //                     "color": "#ffffff"
                    //                 },
                    //                 {
                    //                     "type": "text",
                    //                     "text": "5  ครั้ง",
                    //                     "align": "end",
                    //                     "color": "#daff7d",
                    //                     "weight": "bold"
                    //                 }
                    //             ]
                    //         }
                    //     ]
                    // },
                    // {
                    //     "type": "text",
                    //     "text": "ยอดการแชร์จะเกิดขึ้นได้ถ้าเพื่อนแชร์กิจกรรมต่อให้",
                    //     "wrap": true,
                    //     "color": "#aaaaaa",
                    //     "size": "xxs"
                    // },
                    // {
                    //     "type": "text",
                    //     "text": "ระยะเวลาดูเซ็ทฟรี ถ้าครบ 100% ถือว่าหมดเวลา หากต้องการดูต่อติดต่อ iton5\nเวลาล่าสุด : ",
                    //     "color": "#ffffff",
                    //     "align": "start",
                    //     "gravity": "center",
                    //     "size": "xs",
                    //     "wrap": true
                    // },
                    // {
                    //     "type": "text",
                    //     "text": "50 %",
                    //     "color": "#ffffff",
                    //     "align": "start",
                    //     "size": "xs",
                    //     "gravity": "center",
                    //     "margin": "lg"
                    // },
                    // {
                    //     "type": "box",
                    //     "layout": "vertical",
                    //     "contents": [
                    //         {
                    //             "type": "box",
                    //             "layout": "vertical",
                    //             "contents": [
                    //                 {
                    //                     "type": "filler"
                    //                 }
                    //             ],
                    //             "width": "50%",
                    //             "backgroundColor": "#daff7d",
                    //             "height": "6px"
                    //         }
                    //     ],
                    //     "backgroundColor": "#FAD2A76E",
                    //     "height": "6px",
                    //     "margin": "sm"
                    // },
                    // {
                    //     "type": "box",
                    //     "layout": "vertical",
                    //     "contents": [
                    //         {
                    //             "type": "button",
                    //             "style": "primary",
                    //             "color": "#905c44",
                    //             "action": {
                    //                 "type": "uri",
                    //                 "label": "แชร์กิจกรรม 🎉",
                    //                 "uri": "https://google.com"
                    //             },
                    //             "height": "sm"
                    //         }
                    //     ],
                    //     "maxWidth": "190px",
                    //     "offsetStart": "50px",
                    //     "margin": "lg"
                    // }
                ],
                "paddingAll": "10px",
                "backgroundColor": "#000000"
            }
        }
    }

    return data
}

function other() {

    let data = {
        type: 'text',
        text: `ติดต่อสอบถามได้ที https://www.facebook.com/Srisangwornsukhothai `
    }



    return data
}

function Warning() {

    let data = {
        type: 'text',
        text: `กำลังพัฒนา`
    }



    return data
}

function datePicker() {
    let text = moment().format()
    let date_c = text.toString().substring(0, 16)
    console.log(text.toString().substring(0, 16))
    let data = {
        "type": "text",
        "text": "เลือกวันที่",
        "quickReply": {
            "items": [
                {
                    "type": "action",
                    "action": {
                        "type": "datetimepicker",
                        "label": "คลิกเพื่อเลือกวันที่",
                        "data": "storeId=12345",
                        "mode": "datetime",
                        "initial": date_c,
                        "max": "2024-12-31T23:59",
                        "min": "2021-01-01T00:00"
                    }
                }
            ]
        }
    }



    return data
}
function quickMenu() {

    let data = {
        "type": "text", // ①
        "text": "กรุณาเลือกเมนู",
        "quickReply": { // ②
            "items": [
                {
                    "type": "action", // ③
                    "imageUrl": "https://linebot-swhospital.diligentsoftinter.com/images/user.png",
                    "action": {
                        "type": "message",
                        "label": "ข้อมูลส่วนตัว",
                        "text": "ข้อมูลส่วนตัว"
                    }
                },
                {
                    "type": "action",
                    "imageUrl": "https://linebot-swhospital.diligentsoftinter.com/images/doctor.png",
                    "action": {
                        "type": "message",
                        "label": "จำนวนการจอง",
                        "text": "จำนวนการจอง"
                    }
                },
                {
                    "type": "action",
                    "imageUrl": "https://linebot-swhospital.diligentsoftinter.com/images/smc.jpg",
                    "action": {
                        "type": "message",
                        "label": "เกี่ยวกับ smc",
                        "text": "เกี่ยวกับ smc"
                    }
                },

            ]
        }
    }



    return data
}
function imageAlertOapp(vn) {
    console.log(vn)
    let data = {
        "type": "image",
        "originalContentUrl": `https://linebot-swhospital.diligentsoftinter.com/images/${vn}.png`,
        "previewImageUrl": `https://linebot-swhospital.diligentsoftinter.com/images/${vn}.png`
    }



    return data
}

async function createImageDoctor(tdate) {
    let dateShow = moment(tdate).add(543, 'year').format('LL');
    let data2
    let sql = `SELECT nextdate,d.id,d.name as dname,count(vn_reserve) AS tcount 
    FROM diligent_queue_dep d
    LEFT JOIN diligent_queue_reserve r ON r.dep::int = d.id AND nextdate = '${tdate}'
    GROUP BY nextdate,d.id,dname
    ORDER BY d.id   `
    const response = await db.query(sql);
    if (response.rows.length > 0) {
        console.log(response.rows)
        data2 = response.rows
        // createImageDoctor(response.rows)
    }

    var fileName = './images/doctor_app.png';
    var imageCaption = 'Image caption';
    var loadedImage;


    const width = 300;
    const height = 250;
    const canvas = createCanvas(width, height);

    const context = canvas.getContext("2d");
    context.fillStyle = "yellow";
    context.fillRect(0, 0, width, height);


    context.fillStyle = "#000";
    context.font = "THSarabun";
    context.textAlign = "center";
    context.fillText("Hello, World!", 400, 120);

    context.fillStyle = "#fff";
    context.fillRect(400, 200, 300, 200);

    loadImage(fileName).then((image) => {

        context.drawImage(image, 0, 0);
        context.fillStyle = "#000";
        context.font = "18px THSarabun";
        context.textAlign = "left";
        context.fillText(`วันที่ ${dateShow}`, 95, 60);
        // context.fillText(`SrisangwornSMC`, 325, 50);
        context.font = "20px THSarabun";
        context.fillStyle = "#000";

        let theigth = 75
        data2.map((item, i) => {
            theigth = theigth + 25
            return context.fillText(`${i + 1}.${item.dname}  จำนวน ${item.tcount} คน`, 50, theigth,);

        })

        // context.fillText(`1.โสต ศอ นาสิก  จำนวน 3 คน`, 50, 100,);
        // context.fillText(`2.จักษุวิทยา  จำนวน 13 คน`, 50, 125);
        // context.fillText(`3.ออร์โธปิดิกส์  จำนวน 3 คน`, 50, 150);
        // context.fillText(`4.ศัลยกรรม  จำนวน 3 คน`, 50, 175);
        // context.fillText(`5.สูตินรีเวช  จำนวน 3 คน`, 50, 200);
        // context.fillText(`HN : ${data.hn}`, 220, 310);
        // context.fillText(`วันที่นัด : ${moment(data.nextdate).add(543, 'year').format('LL')}`, 220, 350);
        // context.fillText(`แผนก : ${data.dname}`, 220, 390);

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(`./images/d.png`, buffer);
    });

}

function imageDoctor(tdate) {


    createImageDoctor(tdate)

    let data = {
        "type": "image",
        "originalContentUrl": `https://linebot-swhospital.diligentsoftinter.com/images/d.png`,
        "previewImageUrl": `https://linebot-swhospital.diligentsoftinter.com/images/d.png`
    }
    return data
}

function imageTel() {
    let data = {
        "type": "image",
        "originalContentUrl": `https://sw-center-line.diligentsoftinter.com/images/tel.jpg`,
        "previewImageUrl": `https://sw-center-line.diligentsoftinter.com/images/tel.jpg`
    }
    return data
}

function imageRoom() {
    let data = {
        "type": "image",
        "originalContentUrl": `https://sw-center-line.diligentsoftinter.com/images/room.jpg`,
        "previewImageUrl": `https://sw-center-line.diligentsoftinter.com/images/room.jpg`
    }
    return data
}



function video() {
    let data = {
        "type": "video",
        "originalContentUrl": "https://youtu.be/XBKzpTz65Io",
        "previewImageUrl": "https://example.com/preview.jpg",
        "trackingId": "track-id"
    }

    return data
}

function flexMulti() {
    let data = {
        "type": "template",
        "altText": "this is a carousel template",
        "template": {
            "type": "carousel",
            "columns": [
                {
                    "thumbnailImageUrl": "https://sw.srisangworn.go.th/web/wp-content/uploads/2020/01/2018-01-06-800x445.jpg",
                    "imageBackgroundColor": "#FFFFFF",
                    "title": "แนะนำโรงพยาบาล",
                    "text": "description",
                    "defaultAction": {
                        "type": "uri",
                        "label": "View detail",
                        "uri": "https://youtu.be/AxonsKMPPCs"
                    },
                    "actions": [
                        {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "https://youtu.be/AxonsKMPPCs"
                        }
                    ]
                },
                {
                    "thumbnailImageUrl": "https://sw.srisangworn.go.th/web/wp-content/uploads/2020/01/2018-01-06-800x445.jpg",
                    "imageBackgroundColor": "#FFFFFF",
                    "title": "แนะนำโรงพยาบาล",
                    "text": "description",
                    "defaultAction": {
                        "type": "uri",
                        "label": "View detail",
                        "uri": "https://youtu.be/AxonsKMPPCs"
                    },
                    "actions": [
                        {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "https://youtu.be/AxonsKMPPCs"
                        }
                    ]
                },
            ],
            "imageAspectRatio": "rectangle",
            "imageSize": "cover"
        }
    }

    return data
}



async function pingT() {
    let host = '110.49.126.23'
    ping.sys.probe(host, function (isAlive) {
        // var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
        console.log(isAlive);
        if (!isAlive) {
            let data = {
                to: 'U2c04ba314d6649a7f6f2cc3b554b0ad9',
                messages: [
                    // imageAlertOapp(d.vn_reserve)
                    {
                        type: 'text',
                        text: `110.49.126.23  เดี้ยงจร้า💞`
                    }
                    // flexMulti() 
                ]
            }
            request({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer {${token}}`
                },
                url: 'https://api.line.me/v2/bot/message/push',
                method: 'POST',
                body: data,
                json: true
            }, async function (err, res, body) {
                if (err) console.log('error')
                if (res) { console.log(res) }
                if (body) console.log(body)
            })
        }

    });
}