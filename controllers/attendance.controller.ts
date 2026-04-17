


// ================================checkout api==============================
export const checkOut = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (!attendance) {
      return res.status(400).json({
        message: "Check-in first",
      });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


// ====================================get attendace Api===================================
export const getAttendance = async (req: Request, res: Response) => {
  const data = await prisma.attendance.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  res.json(data);
};