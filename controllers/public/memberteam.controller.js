const { Member } = require("../../models/member.model");

module.exports.getMemberTeam = async (req, res) => {
    
    try {
        const member = await Member.findOne({ tel: req.params.tel })
        if (!member) {
            return res.status(403).send({ message: 'เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของ NBA Platfrom' })
        } else {
            const upline = [member.upline.lv1, member.upline.lv2, member.upline.lv3]
            const validUplines = upline.filter(item => item !== '-')
            const uplineTel = []
            for (const item of validUplines) {
                const include = await Member.findOne({ _id: item })
                uplineTel.push(include.tel);
            }
            
            return res.status(200).send({
                message: 'ดึงข้อมูลสำเร็จ',
                data: {
                    lv1: uplineTel[0] || null,
                    lv2: uplineTel[1] || null,
                    lv3: uplineTel[2] || null
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: 'มีบางอย่างผิดพลาด' })
    }

}