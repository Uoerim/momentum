interface ContactContentProps {
    isLoading?: boolean;
    isActive?: boolean;
}

export default function ContactContent({}: ContactContentProps) {
    return (
        <div className="page-content">
            <h1>Contact</h1>
            <p>Welcome to the contact section. Edit this content in app/components/ContactContent.tsx</p>
        </div>
    );
}
