import { Component, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer
import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list'; // For sidebar list
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'; // Enhanced skeleton
import { NzCommentModule } from 'ng-zorro-antd/comment'; // For comments
import { NzEmptyModule } from 'ng-zorro-antd/empty'; // For empty state
import { NzFormModule } from 'ng-zorro-antd/form'; // For form
import { NzInputModule } from 'ng-zorro-antd/input'; // For input
import { NzMessageService } from 'ng-zorro-antd/message'; // For notification messages
import { Subject } from 'rxjs';
import { switchMap, takeUntil, delay } from 'rxjs/operators';
import { of } from 'rxjs';

// --- Interfaces for Post Detail View ---
interface AuthorInfo {
  id: string;
  name: string;
  avatarUrl: string;
  profileLink?: string; // Link to the author's profile page
}

interface BlogPost {
  id: string;
  title: string;
  /** Full HTML content of the post */
  content: string;
  author: AuthorInfo;
  publishedDate: string; // Or Date object
  readTimeMinutes: number;
  tags: string[];
  // Add other relevant fields like featured image URL, etc.
  // featuredImageUrl?: string;
}

interface SidebarPost {
  id: string;
  title: string;
  authorName: string;
  postLink: string; // Link to this post detail
}

// Comment interfaces
interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string;
}

interface CommentReply {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: string;
  replies?: CommentReply[];
}

// --- Security Pipe for [innerHTML] ---
@Pipe({
  name: 'safeHtml',
  standalone: true, // Make the pipe standalone
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    // IMPORTANT: Ensure your backend or editor provides sanitized HTML
    // or implement more robust sanitization here if needed.
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-blog-post-detail', // Changed selector to reflect purpose
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzGridModule,
    NzAvatarModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzCardModule,
    NzDividerModule,
    NzListModule,       // Added
    NzSkeletonModule,   // Added
    NzCommentModule,    // Added for comments
    NzEmptyModule,      // Added for empty state
    NzFormModule,       // Added for form
    NzInputModule,      // Added for input
    SafeHtmlPipe,       // Added Pipe
  ],
  templateUrl: './post-detail.component.html', // Keep filename or rename
  styleUrls: ['./post-detail.component.css']   // Keep filename or rename
})
export class PostDetailComponent implements OnInit, OnDestroy { // Renamed class is optional

  post: BlogPost | null = null;
  recommendedPosts: SidebarPost[] = [];
  isLoading = true;
  
  // Comment related properties
  comments: Comment[] = [];
  commentContent: string = '';
  replyContent: string = '';
  replyTo: string | null = null;
  commenterName: string = '';
  commenterEmail: string = '';
  isLoggedIn: boolean = false; // Set to true if user is logged in
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private message: NzMessageService
    // private postService: PostService // Inject your actual service
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const postId = params.get('id'); // Expecting post ID like 'post1'
        if (!postId) {
          console.error('Post ID not found in route');
          this.isLoading = false; // Stop loading if no ID
          // Optionally redirect to a 404 page or post list
          // this.router.navigate(['/not-found']);
          return of(null); // Return empty observable
        }
        this.isLoading = true;
        // Replace fetchMockPostData with your actual service call
        // return this.postService.getPostDetails(postId);
        return this.fetchMockPostData(postId); // Simulate API call
      })
    ).subscribe(data => {
      if (data) {
        this.post = data.post;
        this.recommendedPosts = data.recommended;
      } else {
        // Handle case where data loading failed or returned null
        this.post = null;
        this.recommendedPosts = [];
      }
      this.isLoading = false;
    });
    
    // Load comments for this post
    this.loadComments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Mock Data Fetching - Replace with actual API calls ---
  fetchMockPostData(postId: string) {
    console.log(`Fetching data for post: ${postId}`);

    // Simulate finding the post based on ID
    const mockAuthor: AuthorInfo = {
        id: 'rejserin',
        name: 'Rejserin',
        avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256',
        profileLink: '/blog/rejserin' // Link to the author profile component
    };

    let foundPost: BlogPost | null = null;

    if (postId === 'post1') {
        foundPost = {
            id: 'post1',
            title: 'The Psychology Behind Effective Call-to-Actions',
            author: mockAuthor,
            publishedDate: 'Apr 8, 2023',
            readTimeMinutes: 5,
            // IMPORTANT: This HTML should be SANITIZED server-side or by the editor
            content: `
                <p>Understanding human psychology can dramatically improve conversion rates. This post delves into the cognitive biases and motivations that influence user decisions when faced with a Call-to-Action (CTA).</p>
                <h2>Why Psychology Matters in CTAs</h2>
                <p>A CTA isn't just a button; it's a prompt for decision. Effective CTAs leverage psychological principles like:</p>
                <ul>
                    <li><strong>Urgency & Scarcity:</strong> "Limited time offer!" or "Only 3 left!"</li>
                    <li><strong>Social Proof:</strong> "Join 10,000+ happy customers."</li>
                    <li><strong>Authority:</strong> Featuring expert endorsements.</li>
                    <li><strong>Clarity & Value Proposition:</strong> Clearly stating what the user gets.</li>
                </ul>
                <img src="https://via.placeholder.com/600x300.png?text=CTA+Example" alt="Example CTA" style="max-width: 100%; height: auto; margin: 1em 0;">
                <h2>Crafting Better CTAs</h2>
                <p>Focus on action-oriented language, contrasting colors, and strategic placement. A/B testing is crucial to find what resonates best with <em>your</em> audience.</p>
                <blockquote><p>The goal is to make the desired action the easiest and most compelling choice.</p></blockquote>
                <pre><code class="language-html"><button class="cta-button cta-primary">Get Started Now</button></code></pre>
                <p>By applying these psychological insights, you can transform your CTAs from simple links into powerful conversion drivers.</p>
            `,
            tags: ['Marketing', 'Psychology', 'UX', 'Conversion Rate Optimization'],
        };
    } else if (postId === 'post2') {
         foundPost = {
            id: 'post2',
            title: 'Accessibility in Web Design: More Than Just Compliance',
            author: mockAuthor,
            publishedDate: 'Mar 22, 2023',
            readTimeMinutes: 7,
            content: `
                <p>Creating truly inclusive digital experiences requires going beyond minimum WCAG standards. It's about empathy and designing for the diverse range of human abilities.</p>
                <h2>The Core Principles</h2>
                <p>Accessibility ensures people with disabilities (visual, auditory, motor, cognitive) can perceive, understand, navigate, and interact with the web. Key areas include:</p>
                <ul>
                    <li>Semantic HTML for screen readers</li>
                    <li>Keyboard navigability</li>
                    <li>Sufficient color contrast</li>
                    <li>Clear and concise language</li>
                    <li>Captions and transcripts for media</li>
                </ul>
                <h2>Benefits Beyond Compliance</h2>
                <p>Accessible design improves usability for <em>everyone</em>, enhances SEO, and strengthens brand reputation. It's not just a checklist; it's a commitment to inclusivity.</p>
                 <img src="https://via.placeholder.com/600x300.png?text=Accessibility+Demo" alt="Accessibility demonstration" style="max-width: 100%; height: auto; margin: 1em 0;">
                 <p>Start by testing with real users and incorporating accessibility from the beginning of the design process.</p>
            `,
            tags: ['Accessibility', 'Web Design', 'Inclusion', 'WCAG', 'Frontend']
         };
    }
    // Add more mock posts as needed...

    // --- Mock Recommended Posts ---
    const recommended: SidebarPost[] = [
      { id: 'post-rec-1', title: 'Understanding Semantic HTML', authorName: 'Web Dev Weekly', postLink: '/post/post-rec-1' },
      { id: 'post-rec-2', title: 'Color Theory for Designers', authorName: 'Design Hub', postLink: '/post/post-rec-2' },
      { id: 'post-rec-3', title: 'Introduction to A/B Testing', authorName: 'Marketing Pro', postLink: '/post/post-rec-3' },
      { id: 'post-rec-4', title: 'Keyboard Navigation Best Practices', authorName: 'Alice Gray', postLink: '/post/post-rec-4' },
    ];

    // Simulate API delay
    return of({ post: foundPost, recommended }).pipe(delay(800));
  }

  // Comment related methods
  loadComments(): void {
    // Here you would normally fetch comments from an API
    // For now, we'll use mock data
    setTimeout(() => {
      this.comments = this.getMockComments();
    }, 1000);
  }
  
  getMockComments(): Comment[] {
    return [
      {
        id: 'comment1',
        content: 'Bài viết rất hay và bổ ích. Cảm ơn tác giả đã chia sẻ!',
        author: {
          id: 'user1',
          name: 'Nguyễn Văn A',
          avatarUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
        },
        createdAt: '2 giờ trước',
        replies: [
          {
            id: 'reply1',
            content: 'Cảm ơn bạn đã đọc và chia sẻ phản hồi!',
            author: {
              id: 'author1',
              name: 'Rejserin',
              avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256'
            },
            createdAt: '1 giờ trước'
          }
        ]
      },
      {
        id: 'comment2',
        content: 'Tôi đã áp dụng những ý tưởng này vào dự án của mình và thấy hiệu quả tức thì. Rất đáng để thử!',
        author: {
          id: 'user2',
          name: 'Trần Thị B',
          avatarUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        },
        createdAt: '5 giờ trước',
        replies: []
      }
    ];
  }
  
  submitComment(): void {
    if (!this.isCommentValid()) return;
    
    // In a real app, you'd send this to your API
    const newComment: Comment = {
      id: `comment${this.comments.length + 1}`,
      content: this.commentContent,
      author: {
        id: this.isLoggedIn ? 'currentUser' : 'guest',
        name: this.isLoggedIn ? 'Người dùng hiện tại' : this.commenterName,
        avatarUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
      },
      createdAt: 'Vừa xong',
      replies: []
    };
    
    this.comments.unshift(newComment);
    this.message.success('Bình luận của bạn đã được đăng thành công!');
    this.resetCommentForm();
  }
  
  toggleReply(commentId: string): void {
    this.replyTo = this.replyTo === commentId ? null : commentId;
    this.replyContent = '';
  }
  
  submitReply(commentId: string): void {
    if (!this.replyContent) return;
    
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    if (!comment.replies) comment.replies = [];
    
    const newReply: CommentReply = {
      id: `reply${comment.replies.length + 1}`,
      content: this.replyContent,
      author: {
        id: this.isLoggedIn ? 'currentUser' : 'guest',
        name: this.isLoggedIn ? 'Người dùng hiện tại' : this.commenterName || 'Khách',
        avatarUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
      },
      createdAt: 'Vừa xong'
    };
    
    comment.replies.push(newReply);
    this.message.success('Trả lời của bạn đã được đăng thành công!');
    this.replyTo = null;
    this.replyContent = '';
  }
  
  cancelReply(): void {
    this.replyTo = null;
    this.replyContent = '';
  }
  
  isCommentValid(): boolean {
    if (!this.commentContent) return false;
    
    // If not logged in, require name and email
    if (!this.isLoggedIn) {
      return !!this.commenterName && !!this.commenterEmail;
    }
    
    return true;
  }
  
  resetCommentForm(): void {
    this.commentContent = '';
    if (!this.isLoggedIn) {
      // Don't reset name and email to improve UX for multiple comments
    }
  }
}