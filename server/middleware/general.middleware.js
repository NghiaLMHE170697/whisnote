

const getTimeDifference = (createdAt) => {
    const today = Date.now();
    const diffInMilliseconds = today - new Date(createdAt).getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
        return `${diffInDays} ngày`;
    } else if (diffInHours > 0) {
        return `${diffInHours} giờ`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} phút`;
    } else {
        return `${diffInSeconds} giây`;
    }
};

const getVietNamDateFormat = (createdAt) => {
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} tháng ${month} năm ${year}`;
};

module.exports = {
    getTimeDifference,
    getVietNamDateFormat
};