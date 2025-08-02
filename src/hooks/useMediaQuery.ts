import { useState, useEffect } from 'react';

/**
 * Custom hook để theo dõi sự thay đổi kích thước màn hình dựa trên một media query.
 * @param query - Chuỗi media query (ví dụ: '(max-width: 768px)').
 * @returns `true` nếu query khớp, ngược lại là `false`.
 */
export const useMediaQuery = (query: string): boolean => {
    // Lấy trạng thái khớp ban đầu của query
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

        // Đăng ký listener để theo dõi sự thay đổi
        // Dùng addEventListener cho các trình duyệt hiện đại, và addListener làm fallback
        try {
            mediaQueryList.addEventListener('change', listener);
        } catch (e) {
            mediaQueryList.addListener(listener);
        }

        // Dọn dẹp listener khi component unmount
        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch (e) {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]); // Chạy lại effect nếu query thay đổi

    return matches;
};
