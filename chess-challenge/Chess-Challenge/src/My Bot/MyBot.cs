using ChessChallenge.API;
using System;
using System.Collections.Generic;
using System.Linq;

public class MyBot : IChessBot
{
    Move bestMove;
    int maxDepth;

    public Move Think(Board board, Timer timer)
    {
        bestMove = Move.NullMove;

        // Выделяем четверть оставшегося времени на обдумывание хода
        int maxSearchTime = timer.MillisecondsRemaining / 4;

        maxDepth = 3; // Можно увеличивать, если время позволяет

        for (int depth = 1; depth <= maxDepth; depth++)
        {
            // Поиск лучшего хода на текущей глубине
            Search(board, depth, int.MinValue + 1, int.MaxValue);
        }

        // Возвращаем лучший найденный ход, иначе первый легальный
        return bestMove.IsNull ? board.GetLegalMoves()[0] : bestMove;
    }

    int Search(Board board, int depth, int alpha, int beta)
    {
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
                if (depth == maxDepth)
                    bestMove = move;
            }

            alpha = Math.Max(alpha, eval);
            if (alpha >= beta)
                break; // Обрезка по бете
        }

        return bestEval;
    }

    int Evaluate(Board board)
    {
        if (board.IsInCheckmate())
            return board.IsWhiteToMove ? -100000 : 100000;
        if (board.IsDraw())
            return 0;

        int score = 0;

        // Материальная оценка
        score += EvaluateMaterial(board);

        // Позиционная оценка
        score += EvaluatePiecePlacement(board);

        return board.IsWhiteToMove ? score : -score;
    }

    static readonly Dictionary<PieceType, int> pieceValues = new()
    {
        [PieceType.Pawn] = 100,
        [PieceType.Knight] = 320,
        [PieceType.Bishop] = 330,
        [PieceType.Rook] = 500,
        [PieceType.Queen] = 900,
        [PieceType.King] = 0 // Короля не оцениваем по материалу
    };

    int EvaluateMaterial(Board board)
    {
        int eval = 0;

        foreach (PieceType type in pieceValues.Keys)
        {
            int whiteCount = board.GetPieceList(type, true).Count;
            int blackCount = board.GetPieceList(type, false).Count;
            eval += pieceValues[type] * (whiteCount - blackCount);
        }

        return eval;
    }

    int EvaluatePiecePlacement(Board board)
    {
        int eval = 0;

        // Простая таблица централизованности для пешек, коней и слонов
        foreach (PieceType type in new[] { PieceType.Pawn, PieceType.Knight, PieceType.Bishop })
        {
            foreach (var piece in board.GetPieceList(type, true))
            {
                eval += PositionalBonus(type, piece.Square);
            }
            foreach (var piece in board.GetPieceList(type, false))
            {
                eval -= PositionalBonus(type, piece.Square);
            }
        }

        return eval;
    }

    int PositionalBonus(PieceType type, Square square)
    {
        // Пример простой централизованной оценки
        int fileDistFromCenter = Math.Abs(3 - (int)square.File);
        int rankDistFromCenter = Math.Abs(3 - square.Rank);
        int distanceFromCenter = fileDistFromCenter + rankDistFromCenter;

        switch (type)
        {
            case PieceType.Knight:
                return 30 - 5 * distanceFromCenter; // кони сильны в центре
            case PieceType.Bishop:
                return 10 - 2 * distanceFromCenter;
            case PieceType.Pawn:
                return square.Rank; // поощрение продвижения пешек
            default:
                return 0;
        }
    }
}
