import { useMemo } from "react";
import { useUserSubjects } from "@/hooks/useSubjects";

export interface ReviewNotification {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  type: "review";
}

/** Generate review notifications for completed topics the student should revisit */
export function useReviewNotifications(): { reviews: ReviewNotification[] } {
  const { data: courses = [] } = useUserSubjects();

  const reviews = useMemo(() => {
    const items: ReviewNotification[] = [];
    
    courses.forEach((course) => {
      // Suggest reviewing completed topics
      const completedTopics = course.topics.filter((t) => t.status === "completed");
      completedTopics.forEach((topic) => {
        items.push({
          id: `review-${course.id}-${topic.id}`,
          title: `Time to review: ${topic.name}`,
          description: `Strengthen your understanding of ${topic.name} in ${course.name}. A quick recap will help it stick!`,
          subjectId: course.id,
          subjectName: course.name,
          topicId: topic.id,
          topicName: topic.name,
          type: "review",
        });
      });
    });

    // Return max 5 review suggestions, shuffled
    return items.sort(() => Math.random() - 0.5).slice(0, 5);
  }, [courses]);

  return { reviews };
}
