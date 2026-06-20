import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';

const SEED_RESOURCES = [
  {
    title: "Striver's A2Z DSA Course",
    description: "Comprehensive placement preparation video playlist covering core DSA topics like Arrays, LinkedLists, Trees, Graphs, and Dynamic Programming.",
    category: "DSA",
    resourceType: "Video",
    resourceLink: "https://youtube.com/playlist?list=PLgUwDviBHe0oF6SFtJS_t_DLmKLxoqiC3",
    difficultyLevel: "Intermediate",
  },
  {
    title: "LeetCode Top Interview 150",
    description: "Highly curated list of 150 must-solve coding interview questions to master algorithm patterns for top tech recruiters.",
    category: "DSA",
    resourceType: "Website",
    resourceLink: "https://leetcode.com/studyplan/top-interview-150/",
    difficultyLevel: "Advanced",
  },
  {
    title: "IndiaBIX Quantitative Aptitude Guide",
    description: "Comprehensive practice resource containing solved quantitative aptitude and logical reasoning questions with step-by-step solutions.",
    category: "Aptitude",
    resourceType: "Notes",
    resourceLink: "https://www.indiabix.com/aptitude/questions-and-answers/",
    difficultyLevel: "Beginner",
  },
  {
    title: "Database Normalization & SQL Cheatsheet",
    description: "Detailed PDF notes outlining relational database design, Entity-Relationship diagrams, and normalization forms up to BCNF.",
    category: "DBMS",
    resourceType: "PDF",
    resourceLink: "https://gateoverflow.in/",
    difficultyLevel: "Intermediate",
  },
  {
    title: "Operating Systems: Three Easy Pieces (OSTEP)",
    description: "Excellent open-source textbook detailing Virtualization, Concurrency, and Persistence principles with system illustrations.",
    category: "Operating Systems",
    resourceType: "Website",
    resourceLink: "http://pages.cs.wisc.edu/~remzi/OSTEP/",
    difficultyLevel: "Advanced",
  },
  {
    title: "Gate Smashers Computer Networks Playlist",
    description: "Simplified visual lectures covering the OSI Model, TCP/IP layers, routing protocols, and subnet calculations.",
    category: "Computer Networks",
    resourceType: "Video",
    resourceLink: "https://youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_&si=pwjiyah4llLuxdzB",
    difficultyLevel: "Beginner",
  },
  {
    title: "Object-Oriented Programming (OOP) Principles",
    description: "Detailed notes explaining Inheritance, Polymorphism, Abstraction, and Encapsulation with code illustrations.",
    category: "OOP",
    resourceType: "Notes",
    resourceLink: "https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/",
    difficultyLevel: "Beginner",
  },
  {
    title: "Full Stack Open Curriculum",
    description: "Learn modern JavaScript-based web development including React, Redux, Node.js, Express, MongoDB, and GraphQL in one comprehensive course.",
    category: "Web Development",
    resourceType: "Website",
    resourceLink: "https://fullstackopen.com/en/",
    difficultyLevel: "Intermediate",
  },
  {
    title: "Tech Interview Handbook",
    description: "Essential interview cheatsheet covering coding rounds prep, resume formats, behavioral structures, and question banks.",
    category: "Interview Preparation",
    resourceType: "PDF",
    resourceLink: "https://www.techinterviewhandbook.org/",
    difficultyLevel: "Intermediate",
  }
];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if empty, auto-seed if needed
    let count = await Resource.countDocuments();
    if (count === 0) {
      console.log('No resources found. Seeding initial resources...');
      await Resource.insertMany(SEED_RESOURCES);
    }

    const resources = await Resource.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ resources });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching study resources' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role verification
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, resourceType, resourceLink, difficultyLevel } = body;

    // Validate inputs
    if (!title || !description || !category || !resourceType || !resourceLink || !difficultyLevel) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newResource = new Resource({
      title,
      description,
      category,
      resourceType,
      resourceLink,
      difficultyLevel,
    });

    await newResource.save();

    return NextResponse.json(
      { message: 'Resource created successfully', resource: newResource },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating resource' },
      { status: 500 }
    );
  }
}
