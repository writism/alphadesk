import type { YoutubeVideo } from "../../domain/model/youtubeVideo"

interface Props {
    video: YoutubeVideo
}

export function YoutubeVideoCard({ video }: Props) {
    return (
        <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col border border-outline bg-surface-container-low overflow-hidden hover:border-primary"
        >
            <div className="relative aspect-video bg-surface-container overflow-hidden">
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:opacity-90"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-sm text-outline uppercase tracking-widest">
                        NO_THUMB
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1.5">
                <p className="font-mono text-sm font-medium text-on-surface line-clamp-2 leading-snug">
                    {video.title}
                </p>
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary font-bold truncate max-w-[60%]">
                        {video.channel_name}
                    </span>
                    <span className="font-mono text-xs text-outline shrink-0">
                        {new Date(video.published_at).toLocaleDateString("ko-KR")}
                    </span>
                </div>
            </div>
        </a>
    )
}
