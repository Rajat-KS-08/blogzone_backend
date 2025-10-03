export interface IBlog {
    id: string,
    blogTitle: string,
    blogContent: string,
    imageUrl: string,
    likeCount: number,
    createdAt: Date | string,
    dislikeCount: number,
}