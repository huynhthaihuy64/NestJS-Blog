class PostDTO {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}
