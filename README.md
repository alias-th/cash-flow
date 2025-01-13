# Cash flow project

ระบบบันทึกรายรับ รายจ่าย พัฒนาโดยการใช้ Fastify, Mongodb, TypeOrm, Joi, Typescript

---

## Feature

- ระบบ Authentication, Login / Register Account
- ระบบการบันทึกรายรับรายจ่าย และสรุปตามวัน, เดือน, ปี หรือระยะเวลา
- ระบบค้นหา Transaction โดยการ Filter วัน เดือน ปี และ Pagination
- ระบบบันทึก Category
- ระบบจำอุปกรณ์ของ User และสามารถออกจากระบบได้
- รองรับหลายภาษาและจัดการคำหยาบ

---

## DB Diagram

https://dbdiagram.io/d/EdVisory-Test-677be96432a2da11cf1e3a6e

---

## Environment Variables

| ตัวแปร             | คำอธิบาย                   | ตัวอย่าง    |
| ------------------ | -------------------------- | ----------- |
| `PORT`             | Port ที่ Server            | `3000`      |
| `MONGODB_PORT`     | Port ที่ Mongodb           | `27017`     |
| `MONGODB_HOST`     | Host mongodb               | `localhost` |
| `MONGODB_DATABASE` | ชื่อ database              | `cash-flow` |
| `SECRET_MESSAGE`   | รหัสลับใช้ในการสร้าง token | `haha`      |

---

## กำหนด Environment Variables

1. สร้าง `.env` ไว้ใน root directory ของ project:

   ```bash
   touch .env
   ```

2. กำหนดตัวแปรตามตารางด้านบน

---

## เริ่มการทำงานโดยใช้คำสั่งต่อไปนี้

1. ติดตั้ง dependencies:

   ```bash
   npm install
   ```

2. เริ่มการทำงาน :

   ```bash
   npm run dev
   ```

---

## Migrations

สารมารถ migrate data โดยใช้คำสั่งต่อไปนี้

1. เพิ่มข้อมูล

```
npm run migrate:up
```

2. ลบข้อมูล

```
npm run migrate:down
```
