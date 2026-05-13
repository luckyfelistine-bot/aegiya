import { NextRequest, NextResponse } from "next/server";

const lessons = [
  {
    title: "CSS Heartbeat Animation",
    content: `Today's micro-lesson: Create a pulsing heart using CSS keyframes.\n\nKey concepts:\n- @keyframes for smooth animations\n- transform: scale() for the pulse effect\n- animation-timing-function for natural motion\n\nTry it: Change the animation duration and see how the heartbeat feels!`,
  },
  {
    title: "HTML Semantic Structure",
    content: `Today's micro-lesson: Build a semantic medical report layout.\n\nKey concepts:\n- <header>, <main>, <section>, <article> tags\n- Accessible form labels\n- Proper heading hierarchy\n\nTry it: Add a patient info section with proper labels!`,
  },
  {
    title: "JavaScript Event Handling",
    content: `Today's micro-lesson: Interactive quiz with instant feedback.\n\nKey concepts:\n- addEventListener for click events\n- DOM manipulation with querySelector\n- Conditional logic for right/wrong answers\n\nTry it: Add a timer that counts down 10 seconds!`,
  },
];

export async function GET(req: NextRequest) {
  try {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const lesson = lessons[dayOfYear % lessons.length];
    return NextResponse.json({ lesson: lesson.content, title: lesson.title });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
