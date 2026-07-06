# 01. Data Audit

Version: V11

Status: Draft

Owner: Huy Vo

Last Update: TBD

---

## Giới thiệu

Data Audit là tài liệu đầu tiên trong bộ tài liệu thiết kế cơ sở dữ liệu của dự án **MeYeuBe**.

Đây là tài liệu quan trọng nhất trước khi bắt đầu thiết kế PostgreSQL và Cloud Sync.

Mọi tài liệu phía sau đều phải dựa trên kết quả của Data Audit.

Thứ tự thực hiện:

01_Data_Audit

↓

02_JSON_to_Supabase_Mapping

↓

03_Data_Dictionary

↓

04_ERD

↓

05_SUPABASE_SCHEMA

↓

06_Migration

↓

07_Sync Architecture

## Mục đích

Data Audit được tạo ra nhằm kiểm kê toàn bộ dữ liệu đang được sử dụng trong ứng dụng MeYeuBe.

Mục tiêu:

- Hiểu chính xác ứng dụng đang lưu dữ liệu gì.
- Không bỏ sót bất kỳ object nào.
- Không bỏ sót bất kỳ field nào.
- Xác định dữ liệu nào là dữ liệu gốc.
- Xác định dữ liệu nào chỉ là dữ liệu tính toán.
- Chuẩn bị cho quá trình migrate sang PostgreSQL.
- Chuẩn bị cho Cloud Sync nhiều thiết bị.

## Phạm vi Audit

Data Audit bao gồm toàn bộ dữ liệu nghiệp vụ của ứng dụng.

Bao gồm:

- Thông tin bé.
- Thông tin mẹ.
- Thai kỳ.
- Nhật ký.
- Lịch khám.
- Sổ sức khỏe.
- Chăm sóc hằng ngày.
- Kho sữa.
- Dashboard.
- Dashboard Configuration.
- Daily Goals.
- Vaccine.
- Cloud Sync Configuration.

Không bao gồm:

- CSS.
- HTML.
- Icon.
- PWA.
- Manifest.
- Service Worker.
- Source UI.

## Kiến trúc dữ liệu hiện tại

Hiện tại MeYeuBe đang lưu dữ liệu theo mô hình:

Application

↓

localStorage

↓

meYeuBePWA_v4

Đây là mô hình Single Device Database.

Ưu điểm:

- Không cần Backend.
- Không cần Internet.
- Hoạt động Offline.
- Triển khai đơn giản.

Nhược điểm:

- Không đồng bộ nhiều thiết bị.
- Không hỗ trợ nhiều người dùng.
- Không hỗ trợ Realtime.
- Khó xử lý Conflict.
- Khó mở rộng.

## Định hướng V11

Sau V11, MeYeuBe sẽ chuyển sang mô hình:

Application

↓

Storage Service

↓

Sync Service

↓

Supabase PostgreSQL

↓

Offline Cache (localStorage)

Trong đó:

Supabase là Database chính.

localStorage chỉ còn đóng vai trò Cache Offline.

## Quy ước Audit

Mỗi object sẽ được audit theo cấu trúc chuẩn.

Object

↓

Business Purpose

↓

JSON Structure

↓

Field Audit

↓

Business Rules

↓

Relationship

↓

Migration Strategy

↓

Database Recommendation

## Roadmap

Data Audit sẽ được thực hiện theo các giai đoạn sau:

Phase 1

Foundation

Phase 2

Master Data

- Baby
- Mom
- Pregnancy
- Settings

Phase 3

Business Data

- Care Events
- Diary
- Appointment
- Health Book

Phase 4

Milk Module

- Milk Inventory
- Milk Transaction

Phase 5

Dashboard

- Dashboard Configuration
- Daily Goals
- Derived Data

Phase 6

Audit Summary