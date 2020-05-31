const express = require('express');
const app = express();
const lodash = require('lodash');

const expressGraphQL = require('express-graphql');

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLFloat
} = require('graphql');

const courses = require('./courses.json');
const students = require('./students.json');
const grades = require('./grades.json');

const CourseType = new GraphQLObjectType({
    name: 'Course',
    description: 'Represent courses',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)}
    })
});

const StudentType = new GraphQLObjectType({
    name: 'Student',
    description: 'Represent students',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        lastName: {type: GraphQLNonNull(GraphQLString)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        course: {
            type: CourseType,
            resolve: (student) => {
                return courses.find(course => course.id === student.courseId)

            }}
    })
});

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    description: 'Represent grades of students',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        studentId: {type: GraphQLNonNull(GraphQLInt)},
        grade: {type: GraphQLNonNull(GraphQLFloat)},
        course: {
            type: CourseType,
            resolve: (grade) => {
                return courses.find(course => course.id === grade.courseId)

            }},
        student: {
            type: StudentType,
            resolve: (grade) => {
                return students.find(student => student.id === grade.studentId)
            }}      
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List of all courses',
            resolve: () => courses
        },
        students: {
            type: new GraphQLList(StudentType),
            description: 'List of all students',
            resolve: () => students
        },
        grades: {
            type: new GraphQLList(GradeType),
            description: 'List of all grades',
            resolve: () => grades
        },
        course: {
            type: CourseType,
            description: 'Search course for id',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => courses.find(course => course.id === args.id)
        },
        student: {
            type: StudentType,
            description: 'Search student for id',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => students.find(student => student.id === args.id)
        },
        grade: {
            type: GradeType,
            description: 'Search grade for id',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => grades.find(grade => grade.id === args.id)
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addCourse: {
            type: CourseType,
            description: 'Add a course',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const course = {
                    id: courses.length + 1,
                    name: args.name,
                    description: args.description
                }
                courses.push(course)
                return course
            }
        },
        addStudent: {
            type: StudentType,
            description: 'Add a student',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                lastName: {type: GraphQLNonNull(GraphQLString)},
                courseId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const student = {
                    id: students.length + 1,
                    name: args.name,
                    lastName: args.lastName,
                    courseId: args.courseId
                }
                students.push(student)
                return student
            }
        },
        addGrade: {
            type: GradeType,
            description: 'Add a grade',
            args: {
                courseId: {type: GraphQLNonNull(GraphQLInt)},
                studentId: {type: GraphQLNonNull(GraphQLInt)},
                grade: {type: GraphQLNonNull(GraphQLFloat)}
            },
            resolve: (parent, args) => {
                const grade = {
                    id: grades.length + 1,
                    courseId: args.courseId,
                    studentId: args.studentId,
                    grade: args.grade
                }
                grades.push(grade)
                return grade
            }
        },
        deleteCourse: {
            type: CourseType,
            description: "Delete a course",
            args: {
              id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
              const removeCourse = lodash.remove(courses, (course) => {
                return (args.id == course.id);
              });
              return (removeCourse[0]);
            }
          },
          deleteStudent: {
            type: StudentType,
            description: "Delete a student",
            args: {
              id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
              const removeStudent = lodash.remove(students, (student) => {
                return (args.id == student.id);
              });
              return (removeStudent[0]);
            }
          },
          deleteGrade: {
            type: GradeType,
            description: "Delete a grade",
            args: {
              id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
              const removeGrade = lodash.remove(grades, (grade) => {
                return (args.id == grade.id);
              });
              return (removeGrade[0]);
            }
          }
        })
        
    });

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});


app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(3000, () => {
    console.log('Server running');
});