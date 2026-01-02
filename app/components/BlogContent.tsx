interface BlogContentProps {
    isLoading?: boolean;
    isActive?: boolean;
}

export default function BlogContent({}: BlogContentProps) {
    return (
        <div className="page-content">
            <h1>Blog</h1>
            <p>Welcome to the blog section. Edit this content in app/components/BlogContent.tsx</p>
        </div>
    );
}
