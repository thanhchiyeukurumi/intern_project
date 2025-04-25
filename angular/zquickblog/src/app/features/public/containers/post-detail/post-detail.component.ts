import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // For comment form
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card'; // For comments and related articles
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form'; // For comment form
import { NzGridModule } from 'ng-zorro-antd/grid'; // For related articles grid
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'; // For comment options
import { NzMessageService } from 'ng-zorro-antd/message';
import { switchMap, delay } from 'rxjs/operators';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { of } from 'rxjs';

// Interfaces (tùy chọn)
interface AuthorInfo {
  name: string;
  title: string;
  avatarUrl: string;
  profileLink?: string; // Link to author's profile/blog
}

interface PostData {
  id: string;
  title: string;
  author: AuthorInfo;
  publishDate: string; // Or Date object
  contentHtml: string; // Nội dung bài viết dạng HTML
}

interface CommentData {
    id: string;
    authorName: string;
    authorAvatar: string;
    date: string;
    text: string;
}

interface RelatedArticle {
    id: string;
    title: string;
    imageUrl: string;
    excerpt: string;
    readTime: number;
}


@Component({
  selector: 'app-post-detail', // Đổi selector nếu cần
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // Thêm ReactiveFormsModule
    NzAvatarModule,
    NzTypographyModule,
    NzCardModule,
    NzDividerModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule, // Thêm NzFormModule
    NzGridModule,
    NzDropDownModule, // Thêm NzDropDownModule
    NzEmptyModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {

  post: PostData | null = null;
  comments: CommentData[] = [];
  relatedArticles: RelatedArticle[] = [];
  isLoading = true;
  commentForm!: FormGroup;
  isSubmittingComment = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService
    // Inject PostService, CommentService,...
  ) { }

  ngOnInit(): void {
    this.initCommentForm();

    this.route.paramMap.pipe(
      switchMap(params => {
        const postId = params.get('id');
        if (!postId) {
          console.error('Post ID not found in route');
          // Redirect or show error
          return of(null);
        }
        this.isLoading = true;
        // Gọi API lấy chi tiết bài viết, comments, related articles
        return this.fetchPostDetails(postId); // Giả lập API
      })
    ).subscribe(data => {
      if (data) {
        this.post = data.post;
        this.comments = data.comments;
        this.relatedArticles = data.related;
      } else {
        // Handle error case
      }
      this.isLoading = false;
    });
  }

  initCommentForm(): void {
      this.commentForm = this.fb.group({
        commentText: ['', [Validators.required, Validators.minLength(5)]]
      });
  }

  // Hàm giả lập API
  fetchPostDetails(postId: string) {
    console.log(`Fetching details for post: ${postId}`);
    // Simulate fetching data
    const mockAuthor: AuthorInfo = {
      name: 'Jese Leos',
      title: 'Graphic Designer, educator & CEO Flowbite',
      avatarUrl: 'https://flowbite.com/docs/images/people/profile-picture-2.jpg',
      profileLink: '/blog/jese-leos'
    };

    const mockPost: PostData = {
      id: postId,
      title: 'Best practices for successful prototypes',
      author: mockAuthor,
      publishDate: 'Feb 8, 2022',
      contentHtml: `
        <p>As developers, we are always looking for ways to improve our productivity and streamline our workflows. In this article, we will explore eight modern development tools that can help you achieve just that. These tools are designed to make your life easier, whether you are working on a small project or a large-scale application.</p>
        <h2>1. Visual Studio Code</h2>
        <p>Visual Studio Code is a lightweight but powerful source code editor that runs on your desktop and is available for Windows, macOS, and Linux. It comes with built-in support for JavaScript, TypeScript, and Node.js, and has a rich ecosystem of extensions for other languages and frameworks.</p>
        <h2>2. GitHub Copilot</h2>
        <p>GitHub Copilot is an AI-powered code completion tool that helps you write code faster and with fewer errors. It can suggest entire lines or blocks of code based on the context of your project, and it learns from the code you write to provide more accurate suggestions over time.</p>
        <h2>3. Docker</h2>
        <p>Docker is a platform for developing, shipping, and running applications in containers. Containers are lightweight, portable, and consistent environments that ensure your application runs the same way, regardless of where it is deployed.</p>
        <h2>4. Postman</h2>
        <p>Postman is a collaboration platform for API development. It simplifies each step of building an API and streamlines collaboration so you can create better APIs faster. With Postman, you can design, mock, test, and document your APIs all in one place.</p>
        <h2>5. Figma</h2>
        <p>Figma is a web-based design tool that allows you to create, share, and collaborate on designs in real-time. It is perfect for UI/UX designers and front-end developers who need to create and iterate on design prototypes quickly and efficiently.</p>
        <h2>6. Slack</h2>
        <p>Slack is a messaging app for teams that brings all your communication together in one place. It integrates with a wide range of tools and services, making it easy to stay on top of your work and collaborate with your team.</p>
        <h2>7. Notion</h2>
        <p>Notion is an all-in-one workspace where you can write, plan, collaborate, and get organized. It is highly customizable and can be used for a variety of purposes, from note-taking and project management to creating databases and wikis.</p>
        <h2>8. Trello</h2>
        <p>Trello is a visual project management tool that uses boards, lists, and cards to help you organize and prioritize your projects. It is simple to use but powerful enough to handle complex workflows, making it a great choice for teams of all sizes.</p>
        <p>These are just a few of the many tools available to help you boost your productivity as a developer. By incorporating these tools into your workflow, you can save time, reduce errors, and focus on what you do best: writing great code.</p>
      `
    };

     const mockComments: CommentData[] = [
       { id: 'comment-1', authorName: 'Michael Gough', authorAvatar: 'https://flowbite.com/docs/images/people/profile-picture-2.jpg', date: 'Feb 8, 2022', text: 'Very straight-to-point article. Really worth time reading. Thank you! But tools are just the instruments for the UX designers. The knowledge of the design tools are as important as the creation of the design strategy.' },
       // Add more mock comments if needed
     ];

     const mockRelated: RelatedArticle[] = [
        { id: 'related-1', title: 'Our first office', imageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-1.png', excerpt: 'Over the past year, Volosoft has undergone many changes! After months of preparation.', readTime: 2 },
        { id: 'related-2', title: 'Enterprise design tips', imageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-2.png', excerpt: 'Over the past year, Volosoft has undergone many changes! After months of preparation.', readTime: 12 },
        { id: 'related-3', title: 'We partnered with Google', imageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-3.png', excerpt: 'Over the past year, Volosoft has undergone many changes! After months of preparation.', readTime: 8 },
        { id: 'related-4', title: 'Our first project with React', imageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-4.png', excerpt: 'Over the past year, Volosoft has undergone many changes! After months of preparation.', readTime: 4 }
     ];

    return of({
      post: mockPost,
      comments: mockComments,
      related: mockRelated
    }).pipe(delay(500)); // Simulate network delay
  }

  submitComment(): void {
      if (this.commentForm.invalid) {
          this.commentForm.controls['commentText'].markAsDirty();
          this.commentForm.controls['commentText'].updateValueAndValidity();
          this.message.error('Please enter your comment.');
          return;
      }

      this.isSubmittingComment = true;
      const commentText = this.commentForm.value.commentText;
      console.log('Submitting comment:', commentText);

      // --- Gọi API để gửi comment ---
      // this.commentService.postComment(this.post.id, commentText).subscribe({
      //    next: (newComment) => {
      //       this.isSubmittingComment = false;
      //       this.comments.unshift(newComment); // Thêm comment mới vào đầu danh sách
      //       this.commentForm.reset();
      //       this.message.success('Comment posted successfully!');
      //    },
      //    error: (error) => {
      //       this.isSubmittingComment = false;
      //       this.message.error('Failed to post comment. Please try again.');
      //       console.error('Comment submission error:', error);
      //    }
      // });

      // --- Giả lập API call ---
       setTimeout(() => {
          const newComment: CommentData = {
             id: `comment-${Date.now()}`,
             authorName: 'Current User', // Lấy tên user hiện tại
             authorAvatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png', // Avatar user hiện tại
             date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
             text: commentText
          };
          this.comments.unshift(newComment); // Thêm vào đầu
          this.commentForm.reset();
          this.isSubmittingComment = false;
          this.message.success('Comment posted successfully (Simulated)!');
       }, 1000);
  }

  // TODO: Implement comment edit/delete logic if needed
  editComment(commentId: string): void { console.log('Edit comment:', commentId); }
  deleteComment(commentId: string): void { console.log('Delete comment:', commentId); }

}