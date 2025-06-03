using ChessChallenge.API;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;

public class MyBot : IChessBot
{
    Move bestMove;
    int maxDepth;

    public Move Think(Board board, Timer timer)
    {
        bestMove = Move.NullMove;

        // Определяем максимальное время на обдумывание одного хода как четверть оставшегося времени
        int maxSearchTime = timer.MillisecondsRemaining / 4;

        maxDepth = 3; // Можно увеличить глубину, если время позволяет

        for (int depth = 1; depth <= maxDepth; depth++)
        {
            // Выполняем поиск на текущей глубине
            Search(board, depth, int.MinValue + 1, int.MaxValue);
        }

        // Если ход не найден, возвращаем первый легальный
        return bestMove.IsNull ? board.GetLegalMoves()[0] : bestMove;
    }

    int Search(Board board, int depth, int alpha, int beta)
    {
        // Проверка условий завершения: достигнута максимальная глубина, мат или ничья
        if (depth == 0 || board.IsInCheckmate() || board.IsDraw())
        {
            return Evaluate(board);
        }

        Move[] moves = board.GetLegalMoves();
        if (moves.Length == 0) return Evaluate(board);

        int bestEval = int.MinValue + 1;

        foreach (Move move in moves)
        {
            board.MakeMove(move);
            int eval = -Search(board, depth - 1, -beta, -alpha);
            board.UndoMove(move);

            if (eval > bestEval)
            {
                bestEval = eval;

                // Сохраняем лучший ход только на верхнем уровне
                if (depth == maxDepth)
                    bestMove = move;
            }

            alpha = Math.Max(alpha, eval);

            // Обрезка по бете (beta cut-off)
            if (alpha >= beta)
                break;
        }

        return bestEval;
    }

    int Evaluate(Board board)
    {
        // Оценка финальных состояний: мат или ничья
        if (board.IsInCheckmate())
            return board.IsWhiteToMove ? -100000 : 100000;
        if (board.IsDraw())
            return 0;

        int score = 0;

        // Подсчет материального перевеса
        score += EvaluateMaterial(board);

        // Здесь можно добавить оценку позиции, безопасности короля и т.д.

        return board.IsWhiteToMove ? score : -score;
    }

    // Оценочные значения фигур
    static readonly Dictionary<PieceType, int> pieceValues = new()
    {
        [PieceType.Pawn] = 100,
        [PieceType.Knight] = 320,
        [PieceType.Bishop] = 330,
        [PieceType.Rook] = 500,
        [PieceType.Queen] = 900,
        [PieceType.King] = 0
    };

    int EvaluateMaterial(Board board)
    {
        int eval = 0;

        // Вычисляем разницу в количестве фигур между белыми и черными
        foreach (PieceType type in pieceValues.Keys)
        {
            int whiteCount = board.GetPieceList(type, true).Count;
            int blackCount = board.GetPieceList(type, false).Count;
            eval += pieceValues[type] * (whiteCount - blackCount);
        }

        return eval;
    }
}
