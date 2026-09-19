# Reflection — Nguyễn Quang Huy (demo)

## 1. Vai trò của tôi

Tôi là thành viên nhóm HaiKa4, phụ trách phần demo của dự án VLearn Adaptive Tutor. Mục tiêu của phần trình bày là giúp người xem hiểu vấn đề mà nhóm giải quyết: cùng một khái niệm, học viên có nền tảng khác nhau sẽ cần cách giải thích khác nhau.

Với vai trò này, tôi cần nắm được luồng sử dụng, sự khác biệt giữa ba mức giải thích và những giới hạn của prototype để trình bày rõ ràng, đúng với khả năng hiện tại của sản phẩm.

## 2. Phần tôi tham gia

Phần việc của tôi tập trung vào xây dựng luồng trình diễn và cách giới thiệu tính năng. Tôi dựa vào nội dung đặc tả, hướng dẫn chạy trong thư mục `codebase/` và kết quả đánh giá trong thư mục `eval/` để tổ chức nội dung demo theo thứ tự: vấn đề của học viên, giải pháp của nhóm, thao tác trên prototype và bài học sau thử nghiệm.

Kịch bản demo dự kiến gồm:

1. Giới thiệu tình huống học viên nhận được câu trả lời quá khó hoặc quá cơ bản so với nhu cầu.
2. Mở prototype và giới thiệu ba mức: **Mới làm quen**, **Đã có nền tảng**, **Muốn đào sâu**.
3. Đặt một câu hỏi về nội dung bài học, chọn mức giải thích và chờ phản hồi từ model thật.
4. Giữ nguyên câu hỏi, chuyển mức giải thích để so sánh cách trình bày, ví dụ và độ sâu kiến thức.
5. Giải thích rằng thay đổi mức độ phải giữ được tính đúng đắn và bám vào nội dung bài học; mức nâng cao không có nghĩa là tự bổ sung thông tin ngoài nguồn.
6. Kết thúc bằng kết quả thử nghiệm và các giới hạn còn lại của prototype.

Khi chuẩn bị nội dung, tôi chú trọng làm rõ sự khác biệt giữa các mức bằng cách giải thích và độ sâu, thay vì chỉ so sánh độ dài câu trả lời. Tôi cũng cần nói rõ rằng ngữ cảnh bài học hiện là dữ liệu mẫu phục vụ demo, chưa được lấy tự động từ hệ thống VLearn thực tế.

## 3. AI đã hỗ trợ tôi như thế nào

AI hỗ trợ tôi soạn luồng trình diễn, sắp xếp ý và chỉnh câu chữ cho slide, kịch bản demo. Nhờ đó, tôi có thể chuyển các nội dung kỹ thuật như mức giải thích, ngữ cảnh bài học và xử lý lỗi thành cách diễn đạt dễ hiểu hơn với người xem.

Tuy nhiên, bản nháp do AI tạo ra vẫn cần được đối chiếu với prototype và tài liệu của nhóm. Tôi chịu trách nhiệm rà soát nội dung trình bày, tránh mô tả tính năng chưa có hoặc diễn giải kết quả thử nghiệm thành cam kết rằng hệ thống luôn trả lời đúng. Trước khi trình bày, tôi cần tự chạy thử toàn bộ kịch bản để kiểm tra thao tác và thời gian chờ.

## 4. Một bài học từ failure thật của nhóm

Trong Run 02, nhóm thử nghiệm với GLM-5.3-Flash và gặp 11/26 trường hợp không có câu trả lời do timeout hoặc lỗi 502. Việc gọi model, kiểm định và thử lại có thể kéo dài thời gian xử lý, khiến một luồng có nội dung trả lời tốt vẫn không đáp ứng được yêu cầu sử dụng thực tế.

Từ góc nhìn người phụ trách demo, tôi rút ra rằng chất lượng câu trả lời và độ ổn định khi trình diễn đều quan trọng. Tôi cần kiểm tra kết nối, cấu hình model và thời gian phản hồi trước buổi trình bày, đồng thời dành thời gian chờ hợp lý trong kịch bản.

Phương án dự phòng là chuẩn bị video hoặc câu trả lời mẫu để giải thích luồng hoạt động nếu kết nối gặp lỗi, đồng thời nói rõ khi đang sử dụng nội dung đã ghi sẵn. Bài học lớn nhất của tôi là một buổi demo tốt cần cho người xem hiểu cả giá trị của tính năng lẫn cách hệ thống ứng xử khi không hoạt động như mong đợi.
